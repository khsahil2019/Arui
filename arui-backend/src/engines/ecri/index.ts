import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ECRI_REGISTRY_PATH = path.join(__dirname, '../../methodology/ecri_registry');

export const ECRI_METADATA = {
  code: 'ecri',
  name: 'Employability & Career Readiness Index',
  version: 'ecri-v6.0',
  dimensionsCount: 11,
  metricsCount: 132,
  capabilitiesCount: 132,
  cardsCount: 132,
  questionsCount: 153,
  calibrationRulesCount: 22,
  antiGamingRulesCount: 10,
  crossDomainRulesCount: 25,
  badgesCount: 12,
};

