import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const modulesDir = path.join(__dirname, '../src/modules');

interface ApiRoute {
  module: string;
  method: string;
  path: string;
}

const routes: ApiRoute[] = [];

function scanDir(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.name.endsWith('routes.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const regex = /router\.(get|post|put|patch|delete)\(\s*(\[[^\]]+\]|['"`][^'"`]+['"`])/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        const method = match[1].toUpperCase();
        let rawPath = match[2];
        if (rawPath.startsWith('[')) {
          // Array of paths
          const subPaths = rawPath.replace(/[\[\]'"`\s]/g, '').split(',');
          for (const sp of subPaths) {
            routes.push({ module: entry.name, method, path: sp });
          }
        } else {
          const cleanPath = rawPath.replace(/['"`]/g, '');
          routes.push({ module: entry.name, method, path: cleanPath });
        }
      }
    }
  }
}

scanDir(modulesDir);

console.log('====================================================');
console.log(`📊 TOTAL API ENDPOINTS DISCOVERED: ${routes.length}`);
console.log('====================================================\n');

const byModule: Record<string, ApiRoute[]> = {};
for (const r of routes) {
  if (!byModule[r.module]) byModule[r.module] = [];
  byModule[r.module].push(r);
}

for (const [mod, list] of Object.entries(byModule)) {
  console.log(`\n📁 Module: ${mod} (${list.length} endpoints)`);
  for (const item of list) {
    console.log(`   ${item.method.padEnd(7)} ${item.path}`);
  }
}
