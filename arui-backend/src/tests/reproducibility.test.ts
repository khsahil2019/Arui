import { calculateScoreRun } from '../modules/scoring/engine.js';
import { query } from '../db/index.js';

async function testReproducibility() {
  console.log('🧪 Testing Score Run Reproducibility & Determinism...');
  const asm = (await query('SELECT id, methodology_version_id FROM assessments LIMIT 1')).rows[0];
  if (!asm) {
    console.error('No assessment found to test!');
    process.exit(1);
  }

  const run1 = await calculateScoreRun(asm.id, asm.methodology_version_id);
  const run2 = await calculateScoreRun(asm.id, asm.methodology_version_id);

  const match = JSON.stringify(run1) === JSON.stringify(run2);
  console.log(`Deterministic Match: ${match ? '✅ YES' : '❌ NO'}`);
  console.log(`Run 1 Overall: ${run1.overallScore}% | Run 2 Overall: ${run2.overallScore}%`);
  console.log(`Run 1 Assessed Domains: ${run1.assessedDomainsCount} | Run 2 Assessed Domains: ${run2.assessedDomainsCount}`);

  if (!match) {
    console.error('❌ Reproducibility failed: results differed!');
    process.exit(1);
  } else {
    console.log('✅ Reproducibility test passed with 100% deterministic output.\n');
    process.exit(0);
  }
}

testReproducibility().catch((e) => {
  console.error(e);
  process.exit(1);
});
