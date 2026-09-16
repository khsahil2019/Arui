import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ARUI_REGISTRY_PATH = path.join(__dirname, '../../methodology/registry');

export const ARUI_METADATA = {
  code: 'arui',
  name: 'AI-Resilient University Index',
  version: 'v4.0',
  domainsCount: 11,
  metricsCount: 143,
  capabilitiesCount: 143,
  cardsCount: 69,
  questionsCount: 63,
  antiGamingRulesCount: 10,
};
