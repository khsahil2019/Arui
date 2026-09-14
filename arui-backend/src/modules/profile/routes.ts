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

// 25-Field Profile Form Definition matching ProfileFormDefinition in frontend types.ts
export const PROFILE_FORM_DEFINITION = {
  title: 'Institution Profile & Context Calibration',
  description: 'Establishes baseline institutional parameters and context calibration for ARUI evaluation.',
  steps: [
    {
      id: 'identity',
      title: 'Institutional Identity',
      description: 'Core organizational details and structure',
      fields: [
        {
          id: 'IP01_INST_NAME',
          type: 'text',
          label: 'Institution name',
          required: true,
          help: 'Full legal name of the university or constituent institution.',
        },
        {
          id: 'IP02_INST_TYPE',
          type: 'single',
          label: 'Which best describes the institution?',
          required: true,
          options: [
            { value: 'comprehensive', label: 'Comprehensive university' },
            { value: 'technical', label: 'Technical / engineering institution' },
            { value: 'specialist', label: 'Specialist institution' },
            { value: 'affiliated', label: 'Affiliated / constituent college' },
            { value: 'open_distance', label: 'Open / distance university' },
            { value: 'other', label: 'Other institutional form' },
          ],
        },
        {
          id: 'IP03_MANDATE',
          type: 'multi',
          label: 'Institutional mandate',
          required: true,
          help: 'Select all that apply to your primary institutional purpose.',
          options: [
            { value: 'teaching', label: 'Teaching' },
            { value: 'broad_teaching_research', label: 'Broad teaching + research' },
            { value: 'research_intensive', label: 'Research-intensive' },
            { value: 'professional', label: 'Professional / Applied' },
            { value: 'specialist', label: 'Specialist' },
          ],
        },
        {
          id: 'IP04_STATE',
          type: 'single',
          label: 'State / Union Territory',
          required: true,
          options: Object.keys(STATES_DISTRICTS).map((s) => ({ value: s, label: s })),
        },
        {
          id: 'IP05_DISTRICT',
          type: 'single',
          label: 'District',
          required: true,
          dependsOn: 'IP04_STATE',
          options: [],
        },
        {
          id: 'IP06_LOCATION',
          type: 'single',
          label: 'Location type',
          required: true,
          options: [
            { value: 'metro', label: 'Tier 1 Metro' },
            { value: 'urban', label: 'Urban / City' },
            { value: 'semi_urban', label: 'Semi-Urban' },
            { value: 'rural', label: 'Rural' },
          ],
        },
        {
          id: 'IP07_YEAR_ESTABLISHED',
          type: 'text',
          label: 'Year established',
          required: true,
          placeholder: 'e.g. 1985',
        },
      ],
    },
    {
      id: 'scale_and_academics',
      title: 'Academic Scale & Programmes',
      description: 'Enrolment numbers, faculty body and academic programmes',
      fields: [
        {
          id: 'IP08_STUDENT_ENROLLMENT',
          type: 'band',
          label: 'Total student headcount',
          required: true,
          options: [
            { value: 'under_2500', label: 'Under 2,500' },
            { value: '2500_10000', label: '2,500 – 10,000' },
            { value: '10000_25000', label: '10,000 – 25,000' },
            { value: '25000_50000', label: '25,000 – 50,000' },
            { value: 'over_50000', label: '50,000+' },
          ],
        },
        {
          id: 'IP09_FACULTY_COUNT',
          type: 'band',
          label: 'Total full-time faculty count',
          required: true,
          options: [
            { value: 'under_150', label: 'Under 150' },
            { value: '150_500', label: '150 – 500' },
            { value: '500_1500', label: '500 – 1,500' },
            { value: 'over_1500', label: '1,500+' },
          ],
        },
        {
          id: 'IP10_ACTIVE_PROGRAMMES',
          type: 'text',
          label: 'Total active degree programmes',
          required: true,
          placeholder: 'e.g. 48',
        },
        {
          id: 'IP14_MAJOR_DISCIPLINES',
          type: 'multi',
          label: 'Major discipline clusters offered',
          required: true,
          options: [
            { value: 'engineering_cs', label: 'Engineering, Computing & Tech' },
            { value: 'sciences', label: 'Natural & Applied Sciences' },
            { value: 'management_commerce', label: 'Management, Business & Commerce' },
            { value: 'humanities_social', label: 'Humanities & Social Sciences' },
            { value: 'law', label: 'Law & Legal Studies' },
            { value: 'health_medicine', label: 'Medicine, Nursing & Health Sciences' },
            { value: 'design_media', label: 'Design, Architecture & Media' },
          ],
        },
      ],
    },
    {
      id: 'context_calibration',
      title: 'Context & Exposure Calibration (P0-4)',
      description: 'Parameters used for Required Maturity and Transformation Distance calibration',
      fields: [
        {
          id: 'IP15_RESEARCH_INTENSITY',
          type: 'scale5',
          label: 'Research intensity',
          required: true,
          help: '1 = Purely teaching-led to 5 = High-volume doctoral & sponsored research.',
        },
        {
          id: 'IP10_AI_EXPOSURE',
          type: 'single',
          label: 'AI exposure index',
          required: true,
          options: [
            { value: 'low', label: 'Low — Limited technological exposure in core offerings' },
            { value: 'medium', label: 'Medium — Mixed exposure across programmes' },
            { value: 'high', label: 'High — Core curricula heavily exposed to AI transition' },
            { value: 'very_high', label: 'Very High — Rapidly transforming discipline profile' },
          ],
        },
        {
          id: 'IP11_DISCIPLINARY_CONSEQUENCE',
          type: 'single',
          label: 'Disciplinary consequence of AI errors',
          required: true,
          options: [
            { value: 'low', label: 'Low — General exploratory domains' },
            { value: 'medium', label: 'Medium — Standard professional credentials' },
            { value: 'high', label: 'High — Accredited professional & high-stakes domains' },
            { value: 'critical', label: 'Critical — Direct safety, legal, medical or clinical impacts' },
          ],
        },
        {
          id: 'IP16_RESOURCE_ENVELOPE',
          type: 'single',
          label: 'Resource envelope & institutional backing',
          required: true,
          options: [
            { value: 'constrained', label: 'Constrained — Budget-sensitive operations' },
            { value: 'moderate', label: 'Moderate — Stable institutional funding' },
            { value: 'substantial', label: 'Substantial — Well-endowed or tier-1 resourced' },
          ],
        },
      ],
    },
    {
      id: 'lead_assessor',
      title: 'Institutional Assessor & Sign-Off',
      description: 'Contact details for institutional lead',
      fields: [
        {
          id: 'IP13_LEAD_NAME',
          type: 'text',
          label: 'Lead assessor name',
          required: true,
        },
        {
          id: 'IP14_LEAD_TITLE',
          type: 'text',
          label: 'Official designation / title',
          required: true,
        },
        {
          id: 'IP15_LEAD_EMAIL',
          type: 'text',
          label: 'Official email address',
          required: true,
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
