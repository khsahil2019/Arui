import { Router } from 'express';
import { query } from '../../db/index.js';

const router = Router();

router.get('/', async (req, res) => {
  let assessmentId = '987516bd-f4ac-4bac-8040-5089f586d347';
  let totalMetrics = 143;
  let totalDomains = 11;
  let totalUsers = 4;

  try {
    const aRes = await query(`SELECT id FROM assessments ORDER BY created_at DESC LIMIT 1`);
    if (aRes.rows.length > 0) assessmentId = aRes.rows[0].id;
    const mRes = await query(`SELECT count(*) as count FROM metrics`);
    if (mRes.rows.length > 0) totalMetrics = parseInt(mRes.rows[0].count, 10);
    const uRes = await query(`SELECT count(*) as count FROM users`);
    if (uRes.rows.length > 0) totalUsers = parseInt(uRes.rows[0].count, 10);
  } catch (e) {
    // fallback
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ARUI Backend API Explorer & Interactive Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #111827;
      --card-border: #1e293b;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --primary: #3b82f6;
      --primary-hover: #2563eb;
      --emerald: #10b981;
      --amber: #f59e0b;
      --purple: #8b5cf6;
      --rose: #f43f5e;
      --navy: #0f172a;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: 0;
      min-height: 100vh;
    }
    header {
      background: linear-gradient(180deg, #131d31 0%, #090d16 100%);
      border-bottom: 1px solid var(--card-border);
      padding: 2.5rem 2rem;
      position: sticky;
      top: 0;
      z-index: 50;
      backdrop-filter: blur(12px);
    }
    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .badge-green { background: rgba(16, 185, 129, 0.15); color: var(--emerald); border: 1px solid rgba(16, 185, 129, 0.3); }
    .badge-blue { background: rgba(59, 130, 246, 0.15); color: var(--primary); border: 1px solid rgba(59, 130, 246, 0.3); }
    .pulse-dot {
      width: 8px;
      height: 8px;
      background: var(--emerald);
      border-radius: 50%;
      box-shadow: 0 0 10px var(--emerald);
      animation: pulse 2s infinite;
    }
    @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.2); } 100% { opacity: 1; transform: scale(1); } }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1.25rem;
      transition: all 0.2s ease;
    }
    .stat-card:hover { border-color: rgba(59, 130, 246, 0.4); transform: translateY(-2px); }
    .stat-label { font-size: 13px; color: var(--text-muted); text-transform: uppercase; font-weight: 600; }
    .stat-value { font-size: 26px; font-weight: 800; color: #fff; margin-top: 4px; font-family: 'JetBrains Mono', monospace; }
    
    .layout-split {
      display: grid;
      grid-template-columns: 1fr 450px;
      gap: 2rem;
      align-items: start;
    }
    @media (max-width: 1024px) {
      .layout-split { grid-template-columns: 1fr; }
    }
    
    .module-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      margin-bottom: 1.5rem;
      overflow: hidden;
    }
    .module-header {
      background: rgba(30, 41, 59, 0.4);
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--card-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .module-title { font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
    
    .endpoint-item {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      display: flex;
      flex-direction: column;
      gap: 8px;
      transition: background 0.15s ease;
    }
    .endpoint-item:last-child { border-bottom: none; }
    .endpoint-item:hover { background: rgba(255,255,255,0.02); }
    
    .endpoint-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }
    .endpoint-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .method-pill {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      letter-spacing: 0.05em;
    }
    .method-GET { background: rgba(16, 185, 129, 0.15); color: var(--emerald); border: 1px solid rgba(16, 185, 129, 0.3); }
    .method-POST { background: rgba(59, 130, 246, 0.15); color: var(--primary); border: 1px solid rgba(59, 130, 246, 0.3); }
    .method-PUT { background: rgba(245, 158, 11, 0.15); color: var(--amber); border: 1px solid rgba(245, 158, 11, 0.3); }
    .method-PATCH { background: rgba(139, 92, 246, 0.15); color: var(--purple); border: 1px solid rgba(139, 92, 246, 0.3); }
    
    .path-text {
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      color: #e2e8f0;
      font-weight: 500;
      word-break: break-all;
    }
    .btn-test {
      background: rgba(59, 130, 246, 0.15);
      border: 1px solid rgba(59, 130, 246, 0.3);
      color: var(--primary);
      padding: 5px 14px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-test:hover {
      background: var(--primary);
      color: #fff;
    }
    .desc-text { font-size: 13px; color: var(--text-muted); }
    
    .panel-tester {
      position: sticky;
      top: 130px;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .response-view {
      background: #060911;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 1rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #38bdf8;
      max-height: 480px;
      overflow-y: auto;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .input-field {
      width: 100%;
      background: #0b1120;
      border: 1px solid var(--card-border);
      color: #fff;
      padding: 8px 12px;
      border-radius: 6px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
    }
    .quick-links {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .quick-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--card-border);
      color: var(--text);
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      text-decoration: none;
    }
    .quick-btn:hover { background: rgba(255, 255, 255, 0.1); }
  </style>
</head>
<body>

  <header>
    <div class="header-content">
      <div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <h1 style="font-size: 24px; font-weight: 800; letter-spacing: -0.02em;">ARUI Backend API Engine</h1>
          <span class="badge badge-green"><span class="pulse-dot"></span> Live & Healthy</span>
          <span class="badge badge-blue">Port 4000</span>
        </div>
        <p style="font-size: 14px; color: var(--text-muted); margin-top: 4px;">
          Production REST API service for AI Resilient University Index (v4.0 Methodology Engine)
        </p>
      </div>
      <div class="quick-links">
        <a href="http://localhost:8080" target="_blank" class="quick-btn" style="background: #3b82f6; color: white; font-weight: 600;">🚀 Open Frontend App (Port 8080)</a>
        <a href="/health" target="_blank" class="quick-btn">Health Check</a>
        <a href="/methodology/profile-form" target="_blank" class="quick-btn">Profile Schema</a>
      </div>
    </div>
  </header>

  <div class="container">
    
    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Active Assessment ID</div>
        <div class="stat-value" style="font-size: 15px; color: #38bdf8;" id="active-asm-id">${assessmentId}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Methodology Domains</div>
        <div class="stat-value" style="color: #10b981;">${totalDomains} Domains</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Indicators & Metrics</div>
        <div class="stat-value" style="color: #f59e0b;">${totalMetrics} Metrics</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Seeded Database Users</div>
        <div class="stat-value" style="color: #a855f7;">${totalUsers} Users</div>
      </div>
    </div>

    <div class="layout-split">
      
      <!-- API Endpoints List -->
      <div class="api-list">

        <!-- AUTH MODULE -->
        <div class="module-card">
          <div class="module-header">
            <div class="module-title">🔐 1. Authentication & Session APIs</div>
            <span class="badge badge-blue">4 Endpoints</span>
          </div>
          
          <div class="endpoint-item">
            <div class="endpoint-top">
              <div class="endpoint-left">
                <span class="method-pill method-POST">POST</span>
                <span class="path-text">/auth/login</span>
              </div>
              <div style="display: flex; gap: 6px;">
                <button class="btn-test" onclick="loginDemo('sahilkh3014@gmail.com', '123456')">Login as Sahil</button>
                <button class="btn-test" style="color: #8b5cf6; border-color: rgba(139,92,246,0.3); background: rgba(139,92,246,0.15);" onclick="loginDemo('assessor@arui.org', 'arui@2026')">Login as Assessor</button>
              </div>
            </div>
            <div class="desc-text">Authenticates credentials with bcrypt and issues role-based JWT bearer token.</div>
          </div>

          <div class="endpoint-item">
            <div class="endpoint-top">
              <div class="endpoint-left">
                <span class="method-pill method-GET">GET</span>
                <span class="path-text">/auth/me</span>
              </div>
              <button class="btn-test" onclick="executeApi('GET', '/auth/me')">Test</button>
            </div>
            <div class="desc-text">Returns the currently authenticated user session with linked institution & assessment.</div>
          </div>

          <div class="endpoint-item">
            <div class="endpoint-top">
              <div class="endpoint-left">
                <span class="method-pill method-POST">POST</span>
                <span class="path-text">/auth/logout</span>
              </div>
              <button class="btn-test" onclick="executeApi('POST', '/auth/logout')">Test</button>
            </div>
            <div class="desc-text">Terminates active session and invalidates state.</div>
          </div>
        </div>

        <!-- ASSESSOR MODULE -->
        <div class="module-card">
          <div class="module-header">
            <div class="module-title">🔍 2. Assessor Workspace & Audit APIs</div>
            <span class="badge badge-blue">8 Endpoints</span>
          </div>

          <div class="endpoint-item">
            <div class="endpoint-top">
              <div class="endpoint-left">
                <span class="method-pill method-GET">GET</span>
                <span class="path-text">/assessor/queue</span>
              </div>
              <button class="btn-test" onclick="executeApi('GET', '/assessor/queue')">Test</button>
            </div>
            <div class="desc-text">Returns list of institutional assessments in the assessor review queue.</div>
          </div>

          <div class="endpoint-item">
            <div class="endpoint-top">
              <div class="endpoint-left">
                <span class="method-pill method-GET">GET</span>
                <span class="path-text">/assessor/assessments/:id</span>
              </div>
              <button class="btn-test" onclick="executeApi('GET', '/assessor/assessments/' + getAsmId())">Test</button>
            </div>
            <div class="desc-text">Assessor assessment overview with counts, profile summary and domain applicability.</div>
          </div>

          <div class="endpoint-item">
            <div class="endpoint-top">
              <div class="endpoint-left">
                <span class="method-pill method-GET">GET</span>
                <span class="path-text">/assessor/assessments/:id/responses</span>
              </div>
              <button class="btn-test" onclick="executeApi('GET', '/assessor/assessments/' + getAsmId() + '/responses')">Test</button>
            </div>
            <div class="desc-text">Lists all 63 methodology questions with institutional response states and informed metrics.</div>
          </div>

          <div class="endpoint-item">
            <div class="endpoint-top">
              <div class="endpoint-left">
                <span class="method-pill method-GET">GET</span>
                <span class="path-text">/assessor/assessments/:id/evidence</span>
              </div>
              <button class="btn-test" onclick="executeApi('GET', '/assessor/assessments/' + getAsmId() + '/evidence')">Test</button>
            </div>
            <div class="desc-text">Lists submitted evidence with authenticity check, evidence level (E0-E4) and metric links.</div>
          </div>

          <div class="endpoint-item">
            <div class="endpoint-top">
              <div class="endpoint-left">
                <span class="method-pill method-GET">GET</span>
                <span class="path-text">/assessor/assessments/:id/metrics</span>
              </div>
              <button class="btn-test" onclick="executeApi('GET', '/assessor/assessments/' + getAsmId() + '/metrics')">Test</button>
            </div>
            <div class="desc-text">Returns all 143 metrics with maturity (M), implementation (I), outcome (O) scoring and engine outputs.</div>
          </div>

          <div class="endpoint-item">
            <div class="endpoint-top">
              <div class="endpoint-left">
                <span class="method-pill method-GET">GET</span>
                <span class="path-text">/assessor/assessments/:id/context</span>
              </div>
              <button class="btn-test" onclick="executeApi('GET', '/assessor/assessments/' + getAsmId() + '/context')">Test</button>
            </div>
            <div class="desc-text">Returns P0-4 Context Calibration, current vs required maturity, and transformation distances.</div>
          </div>

          <div class="endpoint-item">
            <div class="endpoint-top">
              <div class="endpoint-left">
                <span class="method-pill method-GET">GET</span>
                <span class="path-text">/assessor/assessments/:id/score-runs</span>
              </div>
              <button class="btn-test" onclick="executeApi('GET', '/assessor/assessments/' + getAsmId() + '/score-runs')">Test</button>
            </div>
            <div class="desc-text">Lists history of immutable score runs with input hashes and preliminary overall scores.</div>
          </div>

          <div class="endpoint-item">
            <div class="endpoint-top">
              <div class="endpoint-left">
                <span class="method-pill method-POST">POST</span>
                <span class="path-text">/assessor/assessments/:id/score-runs</span>
              </div>
              <button class="btn-test" style="color: #10b981; border-color: rgba(16,185,129,0.3); background: rgba(16,185,129,0.15);" onclick="executeApi('POST', '/assessor/assessments/' + getAsmId() + '/score-runs', { kind: 'preliminary' })">Execute Score Run</button>
            </div>
            <div class="desc-text">Executes the multi-domain scoring aggregation engine and saves immutable score run record.</div>
          </div>

          <div class="endpoint-item">
            <div class="endpoint-top">
              <div class="endpoint-left">
                <span class="method-pill method-GET">GET</span>
                <span class="path-text">/assessor/assessments/:id/execution-log</span>
              </div>
              <button class="btn-test" onclick="executeApi('GET', '/assessor/assessments/' + getAsmId() + '/execution-log')">Test</button>
            </div>
            <div class="desc-text">Execution log tracking assessor decisions, calibrations, and engine runs.</div>
          </div>
        </div>

        <!-- RESPONDENT / INSTITUTION WORKSPACE -->
        <div class="module-card">
          <div class="module-header">
            <div class="module-title">🏛️ 3. Respondent & Assessment APIs</div>
            <span class="badge badge-blue">8 Endpoints</span>
          </div>

          <div class="endpoint-item">
            <div class="endpoint-top">
              <div class="endpoint-left">
                <span class="method-pill method-GET">GET</span>
                <span class="path-text">/assessments/:id/status</span>
              </div>
              <button class="btn-test" onclick="executeApi('GET', '/assessments/' + getAsmId() + '/status')">Test</button>
            </div>
            <div class="desc-text">Overall lifecycle state machine status (stage, current domain, progress %).</div>
          </div>

          <div class="endpoint-item">
            <div class="endpoint-top">
              <div class="endpoint-left">
                <span class="method-pill method-GET">GET</span>
                <span class="path-text">/assessments/:id/profile</span>
              </div>
              <button class="btn-test" onclick="executeApi('GET', '/assessments/' + getAsmId() + '/profile')">Test</button>
            </div>
            <div class="desc-text">Returns 25-field institutional profile values and completeness score.</div>
          </div>

          <div class="endpoint-item">
            <div class="endpoint-top">
              <div class="endpoint-left">
                <span class="method-pill method-GET">GET</span>
                <span class="path-text">/assessments/:id/screening</span>
              </div>
              <button class="btn-test" onclick="executeApi('GET', '/assessments/' + getAsmId() + '/screening')">Test</button>
            </div>
            <div class="desc-text">Returns Pulse diagnostic screening prompts (≤30 items) with theme navigation.</div>
          </div>

          <div class="endpoint-item">
            <div class="endpoint-top">
              <div class="endpoint-left">
                <span class="method-pill method-GET">GET</span>
                <span class="path-text">/assessments/:id/domains/D01/next</span>
              </div>
              <button class="btn-test" onclick="executeApi('GET', '/assessments/' + getAsmId() + '/domains/D01/next')">Test</button>
            </div>
            <div class="desc-text">Adaptive question router returning the next unanswered prompt in domain D01.</div>
          </div>

          <div class="endpoint-item">
            <div class="endpoint-top">
              <div class="endpoint-left">
                <span class="method-pill method-GET">GET</span>
                <span class="path-text">/assessments/:id/evidence</span>
              </div>
              <button class="btn-test" onclick="executeApi('GET', '/assessments/' + getAsmId() + '/evidence')">Test</button>
            </div>
            <div class="desc-text">Returns institutional evidence items and methodology evidence requirements.</div>
          </div>

          <div class="endpoint-item">
            <div class="endpoint-top">
              <div class="endpoint-left">
                <span class="method-pill method-GET">GET</span>
                <span class="path-text">/assessments/:id/results/preliminary</span>
              </div>
              <button class="btn-test" onclick="executeApi('GET', '/assessments/' + getAsmId() + '/results/preliminary')">Test</button>
            </div>
            <div class="desc-text">Calculates preliminary results, strengths, vulnerabilities, and contradiction signals.</div>
          </div>

          <div class="endpoint-item">
            <div class="endpoint-top">
              <div class="endpoint-left">
                <span class="method-pill method-GET">GET</span>
                <span class="path-text">/reports/:id/pdf</span>
              </div>
              <a class="btn-test" style="text-decoration: none;" id="btn-pdf-link" href="/reports/${assessmentId}/pdf" target="_blank">Download PDF Report</a>
            </div>
            <div class="desc-text">Generates and streams high-fidelity executive assessment summary PDF report.</div>
          </div>
        </div>

      </div>

      <!-- Live Tester Sidebar -->
      <div class="panel-tester">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="font-size: 16px; font-weight: 700;">⚡ Live API Response</h2>
          <span id="response-status" class="badge badge-green">Ready</span>
        </div>

        <div>
          <label style="font-size: 12px; color: var(--text-muted); font-weight: 600;">Assessment ID</label>
          <input type="text" id="custom-asm-id" class="input-field" value="${assessmentId}" onchange="updateAsmId(this.value)">
        </div>

        <div>
          <label style="font-size: 12px; color: var(--text-muted); font-weight: 600;">Active Auth Token (JWT)</label>
          <input type="text" id="auth-token" class="input-field" placeholder="Bearer Token (auto-filled on login)" readonly>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; color: var(--text-muted); font-weight: 600;" id="request-label">Response Payload:</span>
          <button class="quick-btn" onclick="clearViewer()">Clear</button>
        </div>

        <div id="json-viewer" class="response-view">// Click any "Test" button on the left to execute live API calls...
// Click "Login as Sahil" to authenticate and get JWT bearer token!</div>
      </div>

    </div>
  </div>

  <script>
    let currentToken = '';

    function getAsmId() {
      return document.getElementById('custom-asm-id').value.trim() || '${assessmentId}';
    }

    function updateAsmId(val) {
      document.getElementById('active-asm-id').innerText = val;
      document.getElementById('btn-pdf-link').href = '/reports/' + val + '/pdf';
    }

    function clearViewer() {
      document.getElementById('json-viewer').innerText = '// Cleared.';
      document.getElementById('response-status').innerText = 'Ready';
      document.getElementById('response-status').className = 'badge badge-green';
    }

    async function executeApi(method, path, body) {
      const viewer = document.getElementById('json-viewer');
      const statusBadge = document.getElementById('response-status');
      const label = document.getElementById('request-label');

      viewer.innerText = 'Executing ' + method + ' ' + path + '...';
      statusBadge.innerText = 'Loading...';
      statusBadge.className = 'badge badge-blue';
      label.innerText = method + ' ' + path;

      try {
        const headers = { 'Content-Type': 'application/json' };
        if (currentToken) headers['Authorization'] = 'Bearer ' + currentToken;

        const opts = { method, headers };
        if (body) opts.body = JSON.stringify(body);

        const startTime = performance.now();
        const res = await fetch(path, opts);
        const timeTaken = Math.round(performance.now() - startTime);

        statusBadge.innerText = res.status + ' ' + res.statusText + ' (' + timeTaken + 'ms)';
        statusBadge.className = res.ok ? 'badge badge-green' : 'badge badge-rose';

        const text = await res.text();
        try {
          const json = JSON.parse(text);
          viewer.innerText = JSON.stringify(json, null, 2);
          if (json.token) {
            currentToken = json.token;
            document.getElementById('auth-token').value = 'Bearer ' + json.token.substring(0, 24) + '...';
          }
          if (json.assessmentId) {
            updateAsmId(json.assessmentId);
            document.getElementById('custom-asm-id').value = json.assessmentId;
          }
        } catch (e) {
          viewer.innerText = text;
        }
      } catch (err) {
        statusBadge.innerText = 'Error';
        statusBadge.className = 'badge badge-rose';
        viewer.innerText = 'Network/Execution Error:\\n' + err.message;
      }
    }

    async function loginDemo(email, password) {
      await executeApi('POST', '/auth/login', { email, password });
    }
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(html);
});

export default router;
