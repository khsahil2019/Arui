import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), '..');
const backend = path.join(root, 'arui-backend');
const registry = path.join(backend, 'src', 'methodology', 'ecri_registry');
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(registry, name), 'utf8'));
const count = (name) => readJson(name).length;

const expected = {
  dimensions: 11,
  metrics: 132,
  cards: 132,
  anchors: 792,
  calibration_rules: 132,
  anti_gaming_rules: 13,
  cross_domain_rules: 10,
  question_bank: 153,
  evidence_requirements: 132,
  badge_definitions: 3,
};

for (const [name, value] of Object.entries(expected)) {
  if (count(`${name}.json`) !== value) throw new Error(`${name}: expected ${value}, got ${count(`${name}.json`)}`);
}

const questions = readJson('question_bank.json');
if (questions.filter(q => q.role === 'Screening').length !== 21) throw new Error('Screening bank must contain 21 items');
if (questions.filter(q => q.role === 'Diagnostic').length !== 132) throw new Error('Diagnostic bank must contain 132 items');

const ecriIndex = fs.readFileSync(path.join(root, 'university-insights-main/src/routes/ecri.index.tsx'), 'utf8');
if (!ecriIndex.includes('/samples/ECRI_Sample_Executive_Report.pdf')) throw new Error('Public sample report link missing');

const entitlement = fs.readFileSync(path.join(backend, 'src/middleware/entitlement.ts'), 'utf8');
if (!entitlement.includes('requireAssessmentEngineAccess')) throw new Error('Assessment-scoped entitlement guard missing');

const payment = fs.readFileSync(path.join(backend, 'src/modules/entitlements/service.ts'), 'utf8');
if (!payment.includes('PRICE_MISMATCH') || !payment.includes('CURRENCY_MISMATCH')) throw new Error('Authoritative server-side pricing checks missing');

const benchmark = fs.readFileSync(path.join(backend, 'src/modules/benchmarking/service.ts'), 'utf8');
if (!benchmark.includes('peerRows')) throw new Error('Peer-group filtered benchmark sample missing');

console.log('ECRI FINAL RELEASE VALIDATION: PASS');
console.log(JSON.stringify(expected, null, 2));
