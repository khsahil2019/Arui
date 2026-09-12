import { query } from '../src/db/index.js';

async function main() {
  console.log('====================================================');
  console.log('📊 ARUI POSTGRESQL DATABASE INSPECTION');
  console.log('====================================================\n');

  console.log('1. USERS & ROLES IN DATABASE:');
  const users = await query('SELECT id, email, name, role, institution_id, created_at FROM users ORDER BY created_at ASC;');
  console.table(users.rows);

  console.log('\n2. INSTITUTIONS:');
  const inst = await query('SELECT id, name, slug, country, state FROM institutions;');
  console.table(inst.rows);

  console.log('\n3. ASSESSMENTS:');
  const asm = await query('SELECT id, institution_id, title, status, stage, current_domain FROM assessments;');
  console.table(asm.rows);

  console.log('\n4. REGISTRY TABLE TOTALS:');
  const counts = await query(`
    SELECT 
      (SELECT COUNT(*) FROM domains) AS total_domains,
      (SELECT COUNT(*) FROM capabilities) AS total_capabilities,
      (SELECT COUNT(*) FROM metrics) AS total_metrics,
      (SELECT COUNT(*) FROM questions) AS total_questions,
      (SELECT COUNT(*) FROM anti_gaming_rules) AS total_anti_gaming_rules,
      (SELECT COUNT(*) FROM cross_domain_rules) AS total_cross_domain_rules
  `);
  console.table(counts.rows);

  process.exit(0);
}

main().catch(console.error);
