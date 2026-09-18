import { query } from '../../db/index.js';
import type {
  EngineEntitlement,
  EntitlementStatus,
  PaymentTransaction,
  PortfolioSummary,
  PurchaseEngagementInput,
} from './types.js';

export class EntitlementService {
  /**
   * Retrieves full Institutional Assessment Portfolio across all engines (Instructions #60, #63, #78)
   */
  static async getInstitutionPortfolio(institutionId: string): Promise<PortfolioSummary> {
    const instRes = await query(`SELECT id, name FROM institutions WHERE id = $1`, [institutionId]);
    if (instRes.rows.length === 0) {
      throw new Error(`Institution not found: ${institutionId}`);
    }
    const institutionName = instRes.rows[0].name;

    // Get all registered active assessment products (1 per product code)
    const productsRes = await query(
      `SELECT DISTINCT ON (p.code) p.code, p.name, p.description, pp.amount, pp.currency
       FROM products p
       LEFT JOIN product_pricing pp ON p.code = pp.product_code AND pp.is_active = true
       WHERE p.is_active = true
       ORDER BY p.code ASC, pp.created_at DESC NULLS LAST`
    );

    // Get all entitlements for this institution (1 per product code)
    const entRes = await query(
      `SELECT DISTINCT ON (ee.product_code) ee.*, a.id AS assessment_id, a.status AS assessment_status
       FROM engine_entitlements ee
       LEFT JOIN assessments a ON a.institution_id = ee.institution_id AND a.product_code = ee.product_code
       WHERE ee.institution_id = $1
       ORDER BY ee.product_code, ee.created_at DESC, a.created_at DESC NULLS LAST`,
      [institutionId]
    );

    const entMap = new Map<string, any>();
    for (const r of entRes.rows) {
      entMap.set(r.product_code.toLowerCase(), r);
    }

    const entitlements: EngineEntitlement[] = [];
    let totalActive = 0;

    for (const p of productsRes.rows) {
      const code = p.code.toLowerCase();
      const existing = entMap.get(code);

      const status: EntitlementStatus = existing ? (existing.status as EntitlementStatus) : 'NOT_PURCHASED';
      if (status === 'ACTIVE') totalActive++;

      entitlements.push({
        id: existing ? existing.id : `ent-stub-${code}`,
        institutionId,
        productCode: code,
        productName: p.name,
        status,
        cycle: existing?.cycle || '2026-2027',
        paymentId: existing?.payment_id,
        activatedAt: existing?.activated_at,
        expiresAt: existing?.expires_at,
        assessmentId: existing?.assessment_id,
        assessmentStatus: existing?.assessment_status,
        pricingAmount: Number(p.amount || 4999.0),
        currency: p.currency || 'USD',
      });
    }

    return {
      institutionId,
      institutionName,
      entitlements,
      totalActiveEngagements: totalActive,
      totalAvailableEngagements: productsRes.rows.length,
    };
  }

  /**
   * Server-side independent validation of engine entitlement (Instruction #73, #74)
   */
  static async checkEngineAccess(
    institutionId: string,
    productCode: string
  ): Promise<{ isAllowed: boolean; status: EntitlementStatus; reason?: string }> {
    const code = productCode.toLowerCase();
    const res = await query(
      `SELECT status, activated_at, expires_at 
       FROM engine_entitlements 
       WHERE institution_id = $1 AND product_code = $2`,
      [institutionId, code]
    );

    if (res.rows.length === 0) {
      return {
        isAllowed: false,
        status: 'NOT_PURCHASED',
        reason: `${code.toUpperCase()} assessment access has not been purchased for this institution.`,
      };
    }

    const entitlement = res.rows[0];
    const status = entitlement.status as EntitlementStatus;

    if (status === 'ACTIVE') {
      // Check expiration if set
      if (entitlement.expires_at && new Date(entitlement.expires_at) < new Date()) {
        return {
          isAllowed: false,
          status: 'EXPIRED',
          reason: `${code.toUpperCase()} engagement cycle has expired.`,
        };
      }
      return { isAllowed: true, status: 'ACTIVE' };
    }

    return {
      isAllowed: false,
      status,
      reason: `${code.toUpperCase()} assessment status is currently ${status}.`,
    };
  }

  /**
   * Activates engine entitlement and ensures initial assessment workspace exists (Instruction #58, #64)
   */
  static async activateEngineEntitlement(
    institutionId: string,
    productCode: string,
    paymentId?: string,
    cycle: string = '2026-2027'
  ): Promise<EngineEntitlement> {
    const code = productCode.toLowerCase();

    // Upsert entitlement to ACTIVE
    const entRes = await query(
      `INSERT INTO engine_entitlements (
         institution_id, product_code, status, cycle, payment_id, activated_at, updated_at
       )
       VALUES ($1, $2, 'ACTIVE', $3, $4, NOW(), NOW())
       ON CONFLICT (institution_id, product_code, cycle) DO UPDATE SET
         status = 'ACTIVE',
         payment_id = COALESCE(EXCLUDED.payment_id, engine_entitlements.payment_id),
         activated_at = COALESCE(engine_entitlements.activated_at, NOW()),
         updated_at = NOW()
       RETURNING *`,
      [institutionId, code, cycle, paymentId || null]
    );

    const r = entRes.rows[0];

    // Ensure an assessment instance exists for this engine
    const existingAssess = await query(
      `SELECT id, status FROM assessments WHERE institution_id = $1 AND product_code = $2 LIMIT 1`,
      [institutionId, code]
    );

    let assessmentId: string;
    let assessmentStatus: string;

    if (existingAssess.rows.length === 0) {
      // Find active methodology version for this product
      const mvRes = await query(
        `SELECT id FROM methodology_versions WHERE product_code = $1 AND is_active = true ORDER BY created_at DESC LIMIT 1`,
        [code]
      );
      const versionId = mvRes.rows[0]?.id;
      if (!versionId) {
        throw new Error(`No active methodology version registered for product: ${code}`);
      }

      const instRes = await query(`SELECT name FROM institutions WHERE id = $1`, [institutionId]);
      const instName = instRes.rows[0]?.name || 'Institution';

      const newAssess = await query(
        `INSERT INTO assessments (
           product_code, institution_id, methodology_version_id, title, status, stage
         )
         VALUES ($1, $2, $3, $4, 'DRAFT', 'profile')
         RETURNING id, status`,
        [code, institutionId, versionId, `${instName} — ${code.toUpperCase()} Assessment Engagement (${cycle})`]
      );
      assessmentId = newAssess.rows[0].id;
      assessmentStatus = newAssess.rows[0].status;

      // Initialize institution profile
      await query(
        `INSERT INTO institution_profiles (institution_id, assessment_id, status, values_json)
         VALUES ($1, $2, 'in_progress', '{}')
         ON CONFLICT (institution_id, assessment_id) DO NOTHING`,
        [institutionId, assessmentId]
      );
    } else {
      assessmentId = existingAssess.rows[0].id;
      assessmentStatus = existingAssess.rows[0].status;
    }

    return {
      id: r.id,
      institutionId: r.institution_id,
      productCode: r.product_code,
      productName: code.toUpperCase(),
      status: 'ACTIVE',
      cycle: r.cycle,
      paymentId: r.payment_id,
      activatedAt: r.activated_at,
      expiresAt: r.expires_at,
      assessmentId,
      assessmentStatus,
    };
  }

  /**
   * Processes payment and activates the engine-specific entitlement (Instructions #58, #64, #73)
   */
  static async processEnginePayment(
    institutionId: string,
    userId: string | undefined,
    input: PurchaseEngagementInput
  ): Promise<{ transaction: PaymentTransaction; entitlement: EngineEntitlement }> {
    const code = input.productCode.toLowerCase();

    // Get pricing amount
    const priceRes = await query(
      `SELECT amount, currency FROM product_pricing WHERE product_code = $1 AND is_active = true LIMIT 1`,
      [code]
    );
    if (priceRes.rows.length === 0) throw new Error(`No active price configured for ${code}`);
    const amount = Number(priceRes.rows[0].amount);
    const currency = String(priceRes.rows[0].currency);
    if (input.amount !== undefined && Number(input.amount) !== amount) throw new Error('PRICE_MISMATCH');
    if (input.currency !== undefined && String(input.currency).toUpperCase() !== currency.toUpperCase()) throw new Error('CURRENCY_MISMATCH');
    const paymentMode = process.env.PAYMENT_MODE || 'manual';

    const txRef = `tx_${code}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const invoiceNum = `INV-${code.toUpperCase()}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const payRes = await query(
      `INSERT INTO payments (
         institution_id, user_id, product_code, amount, currency, payment_method,
         transaction_reference, status, invoice_number, notes
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $10, $8, $9)
       RETURNING *`,
      [
        institutionId,
        userId || null,
        code,
        amount,
        currency,
        input.paymentMethod || 'CARD',
        txRef,
        invoiceNum,
        input.notes || `Institutional assessment engagement activation for ${code.toUpperCase()}`,
        paymentMode === 'manual' ? 'SUCCESS' : 'PENDING',
      ]
    );

    const payRow = payRes.rows[0];
    const transaction: PaymentTransaction = {
      id: payRow.id,
      institutionId: payRow.institution_id,
      userId: payRow.user_id,
      productCode: payRow.product_code,
      amount: Number(payRow.amount),
      currency: payRow.currency,
      paymentMethod: payRow.payment_method,
      transactionReference: payRow.transaction_reference,
      status: payRow.status,
      invoiceNumber: payRow.invoice_number,
      createdAt: payRow.created_at,
    };

    if (payRow.status !== 'SUCCESS') {
      throw new Error('PAYMENT_PENDING_PROVIDER_CONFIRMATION');
    }
    const entitlement = await this.activateEngineEntitlement(institutionId, code, transaction.id);

    return { transaction, entitlement };
  }
}
