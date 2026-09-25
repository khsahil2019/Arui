import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const samplesDir = path.resolve(__dirname, '../../university-insights-main/public/samples');
const packageDir = path.join(samplesDir, 'ECRI_Public_Profile');

if (fs.existsSync(packageDir)) {
  fs.rmSync(packageDir, { recursive: true, force: true });
}

fs.mkdirSync(path.join(packageDir, 'assets'), { recursive: true });

// Copy index.html
const htmlSource = fs.readFileSync(path.join(samplesDir, 'ECRI_Institutional_Profile.html'), 'utf8');
fs.writeFileSync(path.join(packageDir, 'index.html'), htmlSource);

// Write README.txt
const readme = `ECRI PUBLIC INSTITUTIONAL PROFILE WEBSITE PACKAGE
==================================================
Institution: Metropolitan Apex University
Overall ECRI Score: 74.8 / 100
Validity Period: 2026 – 2027
Methodology Version: ECRI v6.0 Canonical

DEPLOYMENT INSTRUCTIONS:
1. Upload the files in this directory to your web server (e.g. /ecri-profile or https://apex.edu/employability-profile).
2. Alternatively, embed the index.html via an iframe inside your existing institutional portal:
   <iframe src="index.html" width="100%" height="900" frameborder="0"></iframe>
3. For questions or certification re-validation, contact advisory@ecri.org.
`;
fs.writeFileSync(path.join(packageDir, 'README.txt'), readme);

// Zip the package using system zip command
const zipFile = path.join(samplesDir, 'ECRI_Website_Package.zip');
if (fs.existsSync(zipFile)) {
  fs.unlinkSync(zipFile);
}

execSync(`cd "${samplesDir}" && zip -r ECRI_Website_Package.zip ECRI_Public_Profile`);
console.log('Successfully generated ECRI_Website_Package.zip');
