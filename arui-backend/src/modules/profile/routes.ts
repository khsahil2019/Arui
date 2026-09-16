import { Router } from 'express';
import { query } from '../../db/index.js';
import { authenticate, requireInstitutionAccess } from '../../middleware/auth.js';

const router = Router();

// Indian States and Major Districts Reference Data
const STATES_DISTRICTS: Record<string, string[]> = {
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati'],
  'Assam': ['Guwahati', 'Dibrugarh', 'Silchar', 'Jorhat', 'Tezpur'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga'],
  'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Hisar', 'Karnal'],
  'Karnataka': ['Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Mangaluru', 'Hubballi-Dharwad', 'Belagavi'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Udaipur', 'Bikaner', 'Ajmer'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Vellore'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'],
  'Uttar Pradesh': ['Lucknow', 'Noida', 'Kanpur', 'Varanasi', 'Agra', 'Prayagraj', 'Meerut'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Asansol'],
};

// 25-Field Profile Form Definition matching canonical registry (IP01–IP25)
export const PROFILE_FORM_DEFINITION = {
  title: 'Institution Profile & Context Calibration',
  description: 'Captures canonical 25-field institutional profile and baseline context calibration parameters.',
  steps: [
    {
      id: 'identity',
      title: '1. Institutional Identity',
      description: 'Core legal identity, governance, and regional location',
      fields: [
        {
          id: 'IP01',
          type: 'text',
          label: 'Institution name',
          required: true,
          help: 'Full legal name of the university or constituent institution.',
        },
        {
          id: 'IP02',
          type: 'single',
          label: 'Institution type',
          required: true,
          options: [
            { value: 'comprehensive', label: 'Comprehensive university' },
            { value: 'technical', label: 'Technical / STEM institution' },
            { value: 'medical_health', label: 'Medical / Health sciences' },
            { value: 'business_management', label: 'Business / Management' },
            { value: 'liberal_arts', label: 'Liberal Arts' },
            { value: 'specialist', label: 'Specialist / Other' },
          ],
        },
        {
          id: 'IP03',
          type: 'single',
          label: 'Governance type',
          required: true,
          options: [
            { value: 'public_state', label: 'Public / State university' },
            { value: 'private_nonprofit', label: 'Private (Non-profit)' },
            { value: 'private_forprofit', label: 'Private (For-profit)' },
            { value: 'autonomous_deemed', label: 'Autonomous / Deemed university' },
          ],
        },
        {
          id: 'IP04',
          type: 'dropdown',
          label: 'State',
          required: true,
          options: Object.keys(STATES_DISTRICTS).map((s) => ({ value: s, label: s })),
        },
        {
          id: 'IP05',
          type: 'dropdown',
          label: 'District',
          required: true,
          dependsOn: 'IP04',
          options: [],
        },
        {
          id: 'IP06',
          type: 'single',
          label: 'Location',
          required: true,
          options: [
            { value: 'metro', label: 'Metro / Tier-1 city' },
            { value: 'urban', label: 'Urban' },
            { value: 'semi_urban', label: 'Semi-Urban' },
            { value: 'rural', label: 'Rural' },
          ],
        },
        {
          id: 'IP07',
          type: 'number',
          label: 'Year established',
          required: true,
          placeholder: 'e.g. 1985',
        },
      ],
    },
    {
      id: 'scale_and_academics',
      title: '2. Academic Scale & Programmes',
      description: 'Student and faculty headcount, degree programme complexity and disciplines',
      fields: [
        {
          id: 'IP08',
          type: 'number',
          label: 'Students (Headcount)',
          required: true,
          placeholder: 'e.g. 18500',
        },
        {
          id: 'IP09',
          type: 'number',
          label: 'Faculty (Headcount)',
          required: true,
          placeholder: 'e.g. 750',
        },
        {
          id: 'IP10',
          type: 'number',
          label: 'Active degree programmes',
          required: true,
          placeholder: 'e.g. 48',
        },
        {
          id: 'IP11',
          type: 'number',
          label: 'Undergraduate programmes',
          required: true,
          placeholder: 'e.g. 24',
        },
        {
          id: 'IP12',
          type: 'number',
          label: 'Postgraduate programmes',
          required: true,
          placeholder: 'e.g. 18',
        },
        {
          id: 'IP13',
          type: 'number',
          label: 'Doctoral programmes',
          required: false,
          placeholder: 'e.g. 6',
        },
        {
          id: 'IP14',
          type: 'multi',
          label: 'Major disciplines',
          required: true,
          options: [
            { value: 'engineering_cs', label: 'Engineering & Computing' },
            { value: 'sciences', label: 'Natural & Physical Sciences' },
            { value: 'health_medicine', label: 'Medicine & Health Sciences' },
            { value: 'management_commerce', label: 'Management & Business' },
            { value: 'humanities_social', label: 'Humanities & Social Sciences' },
            { value: 'law', label: 'Law & Public Policy' },
            { value: 'education', label: 'Education' },
            { value: 'arts_design', label: 'Arts & Design' },
          ],
        },
      ],
    },
    {
      id: 'context_calibration',
      title: '3. Context Calibration & Financial Bands',
      description: 'Research intensity, expenditure bands and resources',
      fields: [
        {
          id: 'IP15',
          type: 'single',
          label: 'Research intensity',
          required: true,
          options: [
            { value: 'high', label: 'High — Significant funded research and doctoral volume' },
            { value: 'moderate', label: 'Moderate — Emerging research with selective focus' },
            { value: 'low', label: 'Low — Primarily teaching-led with early research' },
            { value: 'teaching_only', label: 'Teaching-only' },
          ],
        },
        {
          id: 'IP16',
          type: 'band',
          label: 'Annual expenditure band',
          required: true,
          options: [
            { value: 'tier1_large', label: 'Over ₹500 Cr / $60M+' },
            { value: 'tier2_medium', label: '₹100 Cr – ₹500 Cr / $12M–$60M' },
            { value: 'tier3_moderate', label: '₹25 Cr – ₹100 Cr / $3M–$12M' },
            { value: 'tier4_constrained', label: 'Under ₹25 Cr / <$3M' },
          ],
        },
        {
          id: 'IP17',
          type: 'band',
          label: 'Technology / IT expenditure band',
          required: true,
          options: [
            { value: 'it_large', label: 'Over ₹25 Cr / $3M+' },
            { value: 'it_medium', label: '₹5 Cr – ₹25 Cr / $600k–$3M' },
            { value: 'it_modest', label: '₹1 Cr – ₹5 Cr / $120k–$600k' },
            { value: 'it_constrained', label: 'Under ₹1 Cr / <$120k' },
          ],
        },
        {
          id: 'IP18',
          type: 'band',
          label: 'Research funding band',
          required: false,
          options: [
            { value: 'rf_large', label: 'Over ₹50 Cr' },
            { value: 'rf_medium', label: '₹10 Cr – ₹50 Cr' },
            { value: 'rf_modest', label: '₹2 Cr – ₹10 Cr' },
            { value: 'rf_minimal', label: 'Under ₹2 Cr' },
          ],
        },
      ],
    },
    {
      id: 'ecosystem_and_mandate',
      title: '4. Ecosystem, Catchment & Institutional Mandate',
      description: 'Industry linkage, student demographics and institutional mission',
      fields: [
        {
          id: 'IP19',
          type: 'single',
          label: 'Industry engagement',
          required: true,
          options: [
            { value: 'extensive', label: 'Extensive — Deep enterprise co-development and funded labs' },
            { value: 'moderate', label: 'Moderate — Structured internships and advisory links' },
            { value: 'limited', label: 'Limited — Ad-hoc placement or guest lectures' },
            { value: 'minimal', label: 'Minimal' },
          ],
        },
        {
          id: 'IP20',
          type: 'single',
          label: 'Innovation / incubation ecosystem',
          required: true,
          options: [
            { value: 'advanced', label: 'Advanced / Active technology incubator with spin-outs' },
            { value: 'emerging', label: 'Emerging entrepreneurship cell / maker space' },
            { value: 'basic', label: 'Basic student innovation club' },
            { value: 'none', label: 'None currently active' },
          ],
        },
        {
          id: 'IP21',
          type: 'multi',
          label: 'Student catchment',
          required: true,
          options: [
            { value: 'local', label: 'Local district' },
            { value: 'state_regional', label: 'State & Regional' },
            { value: 'national', label: 'National' },
            { value: 'international', label: 'International' },
          ],
        },
        {
          id: 'IP22',
          type: 'multi',
          label: 'Student mobility pattern',
          required: true,
          options: [
            { value: 'commuter', label: 'Daily Commuter' },
            { value: 'residential', label: 'Campus Residential' },
            { value: 'hybrid_distance', label: 'Hybrid / Distance' },
          ],
        },
        {
          id: 'IP23',
          type: 'multi',
          label: 'Institutional mandate',
          required: true,
          options: [
            { value: 'teaching', label: 'Teaching-intensive' },
            { value: 'broad_teaching_research', label: 'Broad teaching + research' },
            { value: 'research_intensive', label: 'Research-intensive' },
            { value: 'professional', label: 'Professional / Applied training' },
            { value: 'specialist', label: 'Specialist mission' },
          ],
        },
        {
          id: 'IP24',
          type: 'single',
          label: 'Residential model',
          required: true,
          options: [
            { value: 'fully_residential', label: 'Fully residential campus' },
            { value: 'non_residential', label: 'Non-residential / Commuter only' },
            { value: 'mixed', label: 'Mixed (Residential + Day scholars)' },
          ],
        },
        {
          id: 'IP25',
          type: 'single',
          label: 'International exposure',
          required: false,
          options: [
            { value: 'high', label: 'High — Active international student & faculty mobility' },
            { value: 'moderate', label: 'Moderate — Dual degrees or student exchange' },
            { value: 'low', label: 'Low — Occasional international symposiums' },
            { value: 'none', label: 'None' },
          ],
        },
      ],
    },
  ],
};


// Route: Get Profile Form Schema (Public/Methodology)
router.get('/methodology/profile-form', (req, res) => {
  return res.json(PROFILE_FORM_DEFINITION);
});

// Route: Reference States
router.get('/methodology/reference/states', (req, res) => {
  return res.json({ states: Object.keys(STATES_DISTRICTS) });
});

// Route: Reference Districts for State
router.get('/methodology/reference/states/:state/districts', (req, res) => {
  const { state } = req.params;
  const districts = STATES_DISTRICTS[state] || [];
  return res.json({ state, districts });
});

// Route: Get Profile Values for Assessment/Institution
router.get(['/assessments/:id/profile', '/institutions/:id/profile'], authenticate, requireInstitutionAccess, async (req, res) => {
  const { id } = req.params;
  try {
    const pRes = await query(
      `SELECT * FROM institution_profiles WHERE assessment_id = $1 OR institution_id = $1 ORDER BY updated_at DESC LIMIT 1`,
      [id]
    );
    if (pRes.rows.length === 0) {
      return res.json({
        values: {},
        completenessScore: 0,
        isLocked: false,
        status: 'draft',
      });
    }
    const row = pRes.rows[0];
    return res.json({
      id: row.id,
      institutionId: row.institution_id,
      assessmentId: row.assessment_id,
      values: row.values_json || {},
      completenessScore: Number(row.completeness_score) || 0,
      isLocked: row.is_locked || false,
      status: row.status,
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Route: Save Profile Values
router.put(['/assessments/:id/profile', '/institutions/:id/profile'], authenticate, requireInstitutionAccess, async (req, res) => {
  const { id } = req.params;
  const { values } = req.body;

  if (!values || typeof values !== 'object') {
    return res.status(400).json({ error: 'Values object required' });
  }

  try {
    let assessmentId = id;
    let institutionId = id;

    const asmRes = await query(`SELECT id, institution_id FROM assessments WHERE id = $1`, [id]);
    if (asmRes.rows.length > 0) {
      assessmentId = asmRes.rows[0].id;
      institutionId = asmRes.rows[0].institution_id;
    } else {
      const instRes = await query(`SELECT id FROM institutions WHERE id = $1`, [id]);
      if (instRes.rows.length > 0) {
        institutionId = instRes.rows[0].id;
        const aRes = await query(`SELECT id FROM assessments WHERE institution_id = $1 ORDER BY created_at DESC LIMIT 1`, [institutionId]);
        if (aRes.rows.length > 0) assessmentId = aRes.rows[0].id;
      }
    }

    // Calculate completeness based on key fields
    let filledCount = 0;
    const requiredKeys = ['IP01_INST_NAME', 'IP02_INST_TYPE', 'IP03_MANDATE', 'IP04_STATE', 'IP05_DISTRICT', 'IP08_STUDENT_ENROLLMENT', 'IP09_FACULTY_COUNT', 'IP15_RESEARCH_INTENSITY', 'IP10_AI_EXPOSURE', 'IP11_DISCIPLINARY_CONSEQUENCE', 'IP16_RESOURCE_ENVELOPE'];
    for (const key of requiredKeys) {
      if (values[key] !== undefined && values[key] !== null && values[key] !== '') {
        filledCount++;
      }
    }
    const completenessScore = Math.round((filledCount / requiredKeys.length) * 100);

    const upsertRes = await query(
      `INSERT INTO institution_profiles (institution_id, assessment_id, status, values_json, completeness_score, updated_at)
       VALUES ($1, $2, 'completed', $3, $4, NOW())
       ON CONFLICT (institution_id, assessment_id) DO UPDATE SET
         values_json = EXCLUDED.values_json,
         completeness_score = EXCLUDED.completeness_score,
         status = 'completed',
         updated_at = NOW()
       RETURNING *`,
      [institutionId, assessmentId, JSON.stringify(values), completenessScore]
    );

    // Update institution details if provided
    if (values.IP01_INST_NAME || values.name) {
      await query(
        `UPDATE institutions SET name = COALESCE($1, name), state = COALESCE($2, state), district = COALESCE($3, district), updated_at = NOW() WHERE id = $4`,
        [values.IP01_INST_NAME || values.name, values.IP04_STATE, values.IP05_DISTRICT, institutionId]
      );
    }

    // Advance assessment stage if in profile stage
    await query(
      `UPDATE assessments SET stage = 'pulse', status = 'PULSE', updated_at = NOW() WHERE id = $1 AND stage = 'profile'`,
      [assessmentId]
    );

    const savedRow = upsertRes.rows[0];
    return res.json({
      id: savedRow.id,
      institutionId: savedRow.institution_id,
      assessmentId: savedRow.assessment_id,
      values: savedRow.values_json,
      completenessScore: Number(savedRow.completeness_score),
      isLocked: savedRow.is_locked,
      status: savedRow.status,
    });
  } catch (err) {
    console.error('Error saving profile:', err);
    return res.status(500).json({ error: 'Failed to save profile' });
  }
});

export default router;
