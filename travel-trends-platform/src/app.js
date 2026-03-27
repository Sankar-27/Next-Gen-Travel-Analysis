// ============ TRENDATLAS APP CONTROLLER v2 ============
(function () {
  'use strict';

  // ── State ──
  const state = {
    datasets: [],        // array of { name, rows, fields, schema, cleaned }
    merged: null,        // merged dataset
    eda: null,
    trends: null,
    insights: null,
    recommendations: null,
    cleaningOps: []
  };

  // ── Nav ──
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => activateSection(tab.dataset.section));
  });

  function activateSection(id) {
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.toggle('active', t.dataset.section === id));
    document.querySelectorAll('.section').forEach(s => s.classList.toggle('active', s.id === `section-${id}`));
  }

  // ── File inputs ──
  ['fileInput', 'heroFileInput'].forEach(inputId => {
    const el = document.getElementById(inputId);
    if (el) el.addEventListener('change', e => handleFiles(Array.from(e.target.files)));
  });

  // ── Drag & drop on hero ──
  const heroDrop = document.getElementById('heroDrop');
  if (heroDrop) {
    heroDrop.addEventListener('dragover', e => { e.preventDefault(); heroDrop.classList.add('drag-over'); });
    heroDrop.addEventListener('dragleave', () => heroDrop.classList.remove('drag-over'));
    heroDrop.addEventListener('drop', e => {
      e.preventDefault();
      heroDrop.classList.remove('drag-over');
      handleFiles(Array.from(e.dataTransfer.files));
    });
  }

  // ── Sample buttons ──
  document.querySelectorAll('[data-sample]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.sample;
      if (key === 'all3') {
        loadSamples(['searchTrends', 'climateDestination', 'bookingData']);
      } else {
        loadSamples([key]);
      }
    });
  });

  // ── Clear ──
  document.getElementById('dsClear')?.addEventListener('click', () => {
    state.datasets = [];
    updateDatasetBar();
    resetSections();
  });

  // ── Export ──
  document.getElementById('exportBtn')?.addEventListener('click', () => window.print());

  // ────────────────────────────────────────────────
  // FILE HANDLING
  // ────────────────────────────────────────────────
  function handleFiles(files) {
    const csvFiles = files.filter(f => f.name.endsWith('.csv'));
    if (!csvFiles.length) return;
    const readers = csvFiles.map(f => new Promise(res => {
      const r = new FileReader();
      r.onload = e => res({ name: f.name, csvText: e.target.result });
      r.readAsText(f);
    }));
    Promise.all(readers).then(results => processDatasets(results));
  }

  function loadSamples(keys) {
    const datasets = keys.map(k => ({ name: window.SAMPLE_DATASETS[k].name, csvText: window.SAMPLE_DATASETS[k].csvText }));
    processDatasets(datasets);
  }

  // ────────────────────────────────────────────────
  // PIPELINE
  // ────────────────────────────────────────────────
  async function processDatasets(rawDatasets) {
    showLoader('Parsing datasets…', 5);
    await tick();

    // Parse each
    const parsed = rawDatasets.map(d => {
      const { rows, fields } = Parser.parse(d.csvText);
      const schema = Parser.inferSchema(rows, fields);
      const { cleaned, ops } = Parser.clean(rows, fields, schema);
      return { name: d.name, rows, fields, schema, cleaned, ops, datasetType: Parser.detectDatasetType(fields) };
    });

    // Add to state (merge with existing)
    parsed.forEach(p => {
      const existing = state.datasets.findIndex(d => d.name === p.name);
      if (existing >= 0) state.datasets[existing] = p;
      else state.datasets.push(p);
    });

    updateDatasetBar();

    setLoader('Merging & cleaning…', 20);
    await tick();

    // Merge all datasets
    const allRows = state.datasets.flatMap(d => d.cleaned);
    const allFields = [...new Set(state.datasets.flatMap(d => d.fields))];
    const mergedSchema = Parser.inferSchema(allRows, allFields);
    state.cleaningOps = state.datasets.flatMap(d => d.ops);
    state.merged = { rows: allRows, fields: allFields, schema: mergedSchema, name: state.datasets.map(d => d.name).join(' + ') };

    setLoader('Running exploratory analysis…', 40);
    await tick();
    state.eda = Analyzer.runEDA(allRows, allFields, mergedSchema);

    setLoader('Detecting travel trends…', 60);
    await tick();
    state.trends = Analyzer.detectTrends(allRows, allFields, mergedSchema);

    setLoader('Generating AI insights…', 78);
    await tick();
    const summary = { name: state.merged.name, rowCount: allRows.length, fieldCount: allFields.length, datasetType: state.datasets.map(d=>d.datasetType).join(', ') };
    const localInsights = Analyzer.generateInsights(state.eda, state.trends, allRows, allFields);
    const aiInsights = await AIEngine.generateInsights(summary, state.eda, state.trends);
    state.insights = aiInsights.length > 0 ? aiInsights : localInsights;

    setLoader('Building business report…', 90);
    await tick();
    state.recommendations = await AIEngine.generateRecommendations(summary, state.trends, state.insights);

    setLoader('Rendering dashboard…', 98);
    await tick();

    hideLoader();

    renderOverview();
    renderEDA();
    renderReport();

    activateSection('home');
  }

  // ────────────────────────────────────────────────
  // DATASET BAR
  // ────────────────────────────────────────────────
  function updateDatasetBar() {
    const bar = document.getElementById('datasetBar');
    const chips = document.getElementById('dsChips');
    if (!state.datasets.length) {
      bar.style.display = 'none';
      return;
    }
    bar.style.display = 'flex';
    chips.innerHTML = state.datasets.map(d => `
      <div class="ds-chip">
        <span class="ds-chip-dot"></span>
        <span>${d.name.replace('.csv', '')}</span>
        <span style="opacity:0.5;font-size:9px">${d.cleaned.length} rows</span>
      </div>`).join('');
  }

  function resetSections() {
    document.getElementById('overviewPanel').style.display = 'none';
    ['edaContent','trendsContent','insightsContent','reportContent'].forEach(id => {
      document.getElementById(id).innerHTML = '<div class="empty-state"><span>◈</span><p>Upload a dataset to begin analysis</p></div>';
    });
    document.getElementById('exportBtn').style.display = 'none';
  }

  // ────────────────────────────────────────────────
  // RENDER OVERVIEW
  // ────────────────────────────────────────────────
  function renderOverview() {
    const eda = state.eda;
    const fields = state.merged.fields;
    const schema = state.merged.schema;
    const rows = state.merged.rows;
    const nullTotal = Object.values(schema).reduce((s,v) => s + v.nullCount, 0);

    document.getElementById('statsRow').innerHTML = `
      <div class="stat-card">
        <div class="stat-label">Total Records</div>
        <div class="stat-value">${rows.length.toLocaleString()}</div>
        <div class="stat-sub">across ${state.datasets.length} dataset${state.datasets.length > 1 ? 's' : ''}</div>
      </div>
      <div class="stat-card navy">
        <div class="stat-label">Fields Detected</div>
        <div class="stat-value">${fields.length}</div>
        <div class="stat-sub">${eda.locationFields.length} location · ${eda.metricFields.length} metric</div>
      </div>
      <div class="stat-card teal-soft">
        <div class="stat-label">Trends Detected</div>
        <div class="stat-value">${state.trends.length}</div>
        <div class="stat-sub">${state.trends[0]?.trend || 'analysing…'} leads</div>
      </div>
      <div class="stat-card gold">
        <div class="stat-label">Avg Stay Duration</div>
        <div class="stat-value">${eda.stayDuration?.mean || '—'}<span style="font-size:18px;font-family:var(--font-body);font-weight:300"> days</span></div>
        <div class="stat-sub">${eda.spendStats ? 'Avg spend $' + eda.spendStats.mean.toLocaleString() : 'no spend data'}</div>
      </div>`;

    document.getElementById('schemaGrid').innerHTML = `
      <div class="block-title">Dataset Schema <span class="block-badge">STEP 1 — UNDERSTANDING</span></div>
      <div class="col-chips">
        ${fields.map(f => `
          <div class="col-chip">
            <div class="col-chip-name">${f}</div>
            <div class="col-chip-type">${schema[f].type} · ${schema[f].uniqueCount} unique</div>
            ${schema[f].sample.length ? `<div class="col-chip-type" style="font-size:9px;color:var(--text-muted)">${schema[f].sample.slice(0,2).join(', ')}</div>` : ''}
          </div>`).join('')}
      </div>`;

    document.getElementById('cleaningLog').innerHTML = `
      <div class="block-title">Data Cleaning Summary <span class="block-badge">STEP 2 — CLEANING</span></div>
      ${state.cleaningOps.map(op => `<div class="clean-item"><span class="clean-check">✓</span><span>${op}</span></div>`).join('')}`;

    document.getElementById('dataPreview').innerHTML = `
      <div style="padding:16px 20px 10px;border-bottom:1px solid var(--border)">
        <span class="block-title" style="font-size:18px">Data Preview</span>
        <span class="block-badge" style="margin-left:10px">FIRST 8 ROWS</span>
      </div>
      <div style="overflow-x:auto">
        <table class="data-table">
          <thead><tr>${fields.slice(0,8).map(f=>`<th>${f}</th>`).join('')}</tr></thead>
          <tbody>
            ${rows.slice(0,8).map(r=>`<tr>${fields.slice(0,8).map(f=>`<td>${r[f]??'—'}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </div>`;

    document.getElementById('overviewPanel').style.display = 'block';
  }

  // ────────────────────────────────────────────────
  // RENDER EDA
  // ────────────────────────────────────────────────
  function renderEDA() {
    const c = document.getElementById('edaContent');
    const eda = state.eda;
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    c.innerHTML = `
      <div class="eda-stats-row">
        <div class="stat-card">
          <div class="stat-label">Location Fields</div>
          <div class="stat-value">${eda.locationFields.length}</div>
          <div class="stat-sub">${eda.locationFields.slice(0,3).join(', ')}</div>
        </div>
        <div class="stat-card navy">
          <div class="stat-label">Peak Month</div>
          <div class="stat-value">${eda.seasonalPattern?.peakMonth || '—'}</div>
          <div class="stat-sub">Highest demand</div>
        </div>
        <div class="stat-card teal-soft">
          <div class="stat-label">Avg Stay</div>
          <div class="stat-value">${eda.stayDuration?.mean || '—'}<span style="font-size:16px"> d</span></div>
          <div class="stat-sub">Range ${eda.stayDuration?.min||'?'}–${eda.stayDuration?.max||'?'} days</div>
        </div>
        <div class="stat-card gold">
          <div class="stat-label">Avg Spend</div>
          <div class="stat-value">${eda.spendStats ? '$' + Math.round(eda.spendStats.mean/1000)+'k' : '—'}</div>
          <div class="stat-sub">${eda.spendStats ? 'Median $' + eda.spendStats.median : 'No spend data'}</div>
        </div>
      </div>
      <div id="edaChartsZone"></div>`;

    Charts.buildEDACharts(document.getElementById('edaChartsZone'), eda, state.merged.rows, state.merged.fields);
  }

  // ────────────────────────────────────────────────
  // RENDER TRENDS
  // ────────────────────────────────────────────────
  function renderTrends() {
    const c = document.getElementById('trendsContent');
    const trends = state.trends;
    if (!trends.length) {
      c.innerHTML = '<div class="empty-state"><span>◈</span><p>No strong trends detected in this dataset.</p></div>';
      return;
    }
    c.innerHTML = `
      <div class="section-title">Detected Trends</div>
      <div class="section-sub">${trends.length} trend${trends.length>1?'s':''} identified with supporting evidence</div>
      <div class="trends-grid">
        ${trends.map(t => `
          <div class="trend-card">
            <div class="trend-card-top">
              <div class="trend-icon-wrap">${t.icon}</div>
              <span class="trend-badge ${t.badgeClass}">${t.trend}</span>
            </div>
            <h3>${t.trend}</h3>
            <p>${t.description}</p>
            <div class="trend-evidence-list">
              ${t.evidence.map(e => `
                <div class="trend-evidence-item">
                  <span class="tei-check">✓</span>
                  <span>${e}</span>
                </div>`).join('')}
            </div>
            <div class="trend-score-row">
              <div class="trend-score-bar"><div class="trend-score-fill" style="width:${t.score}%"></div></div>
              <span class="trend-confidence">Confidence: ${t.confidence} · ${t.score}/100</span>
            </div>
          </div>`).join('')}
      </div>
      <div id="trendRadarWrap"></div>`;

    Charts.buildTrendRadar(document.getElementById('trendRadarWrap'), trends);
  }

  // ────────────────────────────────────────────────
  // RENDER INSIGHTS
  // ────────────────────────────────────────────────
  function renderInsights() {
    const c = document.getElementById('insightsContent');
    const insights = state.insights;
    if (!insights?.length) { c.innerHTML = '<div class="empty-state"><span>◈</span><p>No insights generated.</p></div>'; return; }

    const colorMap = { primary: '', amber: 'gold-accent', green: 'green-accent', violet: 'navy-accent' };
    c.innerHTML = `
      <div class="section-title">Intelligence Briefing</div>
      <div class="section-sub">AI-generated observations and strategic signals from your dataset</div>
      <div class="insights-list">
        ${insights.map(ins => `
          <div class="insight-card ${colorMap[ins.color]||''}">
            <div class="insight-type">${ins.type || 'Insight'}</div>
            <p class="insight-text">${ins.text}</p>
          </div>`).join('')}
      </div>`;
  }

  // ────────────────────────────────────────────────
  // RENDER BUSINESS REPORT
  // ────────────────────────────────────────────────
  function renderReport() {
    const c = document.getElementById('reportContent');
    const recos = state.recommendations;
    const trends = state.trends;
    const eda = state.eda;
    const rows = state.merged.rows;
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    // Market opportunity rows from top destinations
    const destOpps = (eda.topDestinations || []).slice(0, 8).map((d, i) => {
      const growth = eda.growthMetrics?.find(g => g.dest === d.name);
      const growthVal = growth ? `+${growth.avgGrowth}%` : '—';
      const priority = i < 3 ? 'High' : i < 6 ? 'Medium' : 'Medium';
      return { dest: d.name, records: d.count, growth: growthVal, priority };
    });

    c.innerHTML = `
      <!-- COVER -->
      <div class="report-cover">
        <div class="rc-eyebrow">TrendAtlas · Strategic Intelligence Report</div>
        <div class="rc-title">Travel Market<br>Intelligence Report</div>
        <div class="rc-sub">${state.merged.name}</div>
        <div class="rc-meta">
          <div class="rc-meta-item"><div class="rcm-label">Date</div><div class="rcm-value">${today}</div></div>
          <div class="rc-meta-item"><div class="rcm-label">Records Analysed</div><div class="rcm-value">${rows.length.toLocaleString()}</div></div>
          <div class="rc-meta-item"><div class="rcm-label">Trends Detected</div><div class="rcm-value">${trends.length}</div></div>
          <div class="rc-meta-item"><div class="rcm-label">Top Trend</div><div class="rcm-value">${trends[0]?.trend || '—'}</div></div>
        </div>
      </div>

      <!-- SECTION 1: EXECUTIVE SUMMARY -->
      <div class="report-section">
        <div class="rs-header">
          <div class="rs-number">01</div>
          <div class="rs-title">Executive Summary</div>
        </div>
        <div class="rs-body">
          <p>This intelligence report presents the findings from TrendAtlas's automated analysis of <strong>${rows.length.toLocaleString()} travel records</strong> spanning ${state.datasets.length} dataset${state.datasets.length > 1 ? 's' : ''}. The analysis pipeline identified <strong>${trends.length} distinct travel trend${trends.length !== 1 ? 's' : ''}</strong>, with ${trends[0]?.trend || 'emerging patterns'} emerging as the dominant signal.</p>
          <p>${trends.length > 0 ? `The dataset reveals strong evidence of ${trends.slice(0,3).map(t=>t.trend).join(', ')} — behaviours that collectively represent a structural shift away from mass tourism toward purpose-led, experience-driven travel. These trends carry significant implications for product strategy, destination positioning, and marketing investment.` : 'The dataset contains travel records suitable for further analysis and trend positioning.'}</p>
          ${eda.growthMetrics?.length ? `<p>Destination growth analysis identifies <strong>${eda.growthMetrics[0].dest}</strong> as the fastest-growing market at <strong>+${eda.growthMetrics[0].avgGrowth}% average growth</strong>, presenting early-mover positioning opportunities for travel companies and tourism boards.</p>` : ''}
        </div>
      </div>

      <!-- SECTION 2: MARKET OVERVIEW -->
      <div class="report-section">
        <div class="rs-header">
          <div class="rs-number">02</div>
          <div class="rs-title">Market Overview & Key Metrics</div>
        </div>
        <div class="rs-body">
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px">
            ${[
              { label: 'Dataset Coverage', value: rows.length.toLocaleString() + ' records', sub: state.datasets.length + ' source' + (state.datasets.length>1?'s':'') },
              { label: 'Avg Stay Duration', value: (eda.stayDuration?.mean || '—') + ' days', sub: `Range: ${eda.stayDuration?.min||'?'}–${eda.stayDuration?.max||'?'} days` },
              { label: 'Avg Trip Spend', value: eda.spendStats ? '$' + eda.spendStats.mean.toLocaleString() : 'N/A', sub: eda.spendStats ? 'Median $' + eda.spendStats.median : '' },
              { label: 'Seasonal Peak', value: eda.seasonalPattern?.peakMonth || '—', sub: 'Highest booking month' },
              { label: 'Top Destination', value: eda.topDestinations?.[0]?.name || '—', sub: (eda.topDestinations?.[0]?.count || 0) + ' records' },
              { label: 'Trends Identified', value: trends.length.toString(), sub: 'High confidence: ' + trends.filter(t=>t.confidence==='High').length }
            ].map(m => `
              <div style="background:var(--bg-card-alt);border:1px solid var(--border);border-radius:var(--radius-sm);padding:16px">
                <div style="font-size:10px;font-family:var(--font-mono);color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">${m.label}</div>
                <div style="font-family:var(--font-display);font-size:26px;font-weight:400;color:var(--navy);margin-bottom:4px">${m.value}</div>
                <div style="font-size:11px;color:var(--text-muted)">${m.sub}</div>
              </div>`).join('')}
          </div>
          ${destOpps.length ? `
          <div style="overflow-x:auto">
            <table class="opportunity-table">
              <thead>
                <tr><th>Destination</th><th>Records</th><th>Growth Signal</th><th>Priority</th></tr>
              </thead>
              <tbody>
                ${destOpps.map(d => `
                  <tr>
                    <td><strong>${d.dest}</strong></td>
                    <td>${d.records}</td>
                    <td style="color:var(--teal-dark);font-weight:500">${d.growth}</td>
                    <td><span class="opp-tag opp-${d.priority === 'High' ? 'high' : 'med'}">${d.priority}</span></td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>` : ''}
        </div>
      </div>

      <!-- SECTION 3: TREND INTELLIGENCE -->
      <div class="report-section">
        <div class="rs-header">
          <div class="rs-number">03</div>
          <div class="rs-title">Travel Trend Intelligence</div>
        </div>
        <div class="rs-body">
          ${trends.length ? trends.map(t => `
            <div style="padding:14px 0;border-bottom:1px solid var(--border)">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
                <span style="font-size:20px">${t.icon}</span>
                <strong style="font-family:var(--font-display);font-size:17px;color:var(--navy)">${t.trend}</strong>
                <span class="trend-badge ${t.badgeClass}">${t.confidence} Confidence</span>
              </div>
              <p style="font-size:13px;color:var(--text-secondary);line-height:1.65;margin-bottom:8px">${t.description}</p>
              <div style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono)">${t.evidence.join(' · ')}</div>
            </div>`).join('') : '<p>No strong trends detected.</p>'}
        </div>
      </div>

      <!-- SECTION 4: AI INSIGHTS -->
      <div class="report-section">
        <div class="rs-header">
          <div class="rs-number">04</div>
          <div class="rs-title">Strategic Intelligence Observations</div>
        </div>
        <div class="rs-body">
          ${(state.insights || []).map(ins => `
            <div style="padding:14px 0;border-bottom:1px solid var(--border)">
              <div style="font-size:9.5px;font-family:var(--font-mono);color:var(--teal);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">${ins.type}</div>
              <p style="font-size:13.5px;color:var(--text-secondary);line-height:1.75">${ins.text}</p>
            </div>`).join('')}
        </div>
      </div>

      <!-- SECTION 5: STAKEHOLDER RECOMMENDATIONS -->
      <div class="report-section">
        <div class="rs-header">
          <div class="rs-number">05</div>
          <div class="rs-title">Strategic Recommendations by Stakeholder</div>
        </div>
        <div class="rs-body">
          <p>Based on the trend intelligence derived from your dataset, the following strategic actions are recommended for four primary stakeholder groups:</p>
          <div class="stakeholder-grid" style="margin-top:20px">
            ${(recos || []).map(r => `
              <div class="sk-card">
                <div class="sk-header">
                  <div class="sk-icon">${r.icon}</div>
                  <div class="sk-name">${r.audience}</div>
                </div>
                <ul>${(r.points||[]).map(p=>`<li>${p}</li>`).join('')}</ul>
              </div>`).join('')}
          </div>
        </div>
      </div>

      <!-- SECTION 6: CONCLUSIONS -->
      <div class="report-section" style="margin-bottom:0">
        <div class="rs-header">
          <div class="rs-number">06</div>
          <div class="rs-title">Conclusions & Next Steps</div>
        </div>
        <div class="rs-body">
          <p>The analysis of ${rows.length.toLocaleString()} travel records confirms a meaningful evolution in global tourism behaviour. ${trends[0] ? `The prominence of <strong>${trends[0].trend}</strong> as the leading detected trend reflects a broader structural shift in traveller motivations that is unlikely to reverse in the near term.` : 'Multiple travel behaviour patterns are present in the dataset.'}</p>
          <p>For organisations operating in the travel sector, the primary strategic imperative is to move beyond reactive trend adoption toward <strong>proactive trend positioning</strong> — investing in product development, content strategy, and partnership infrastructure ahead of mainstream demand curves.</p>
          <p>TrendAtlas recommends scheduling a quarterly refresh of this analysis as new booking, search, and destination data becomes available, ensuring that strategic decisions remain grounded in the most current intelligence available.</p>
          <div style="display:flex;gap:12px;margin-top:20px;flex-wrap:wrap">
            ${trends.slice(0,4).map(t => `
              <div style="padding:10px 16px;background:var(--bg-teal-soft);border:1px solid var(--border-teal);border-radius:var(--radius-sm);font-size:12px;color:var(--teal-dark)">
                ${t.icon} <strong>${t.trend}</strong> — ${t.confidence} priority
              </div>`).join('')}
          </div>
        </div>
      </div>

      <div style="text-align:center;padding:32px 0 16px;font-size:11px;color:var(--text-muted);font-family:var(--font-mono)">
        Generated by TrendAtlas · ${today} · Powered by Claude AI
      </div>`;

    document.getElementById('exportBtn').style.display = 'inline-flex';
  }

  // ────────────────────────────────────────────────
  // LOADER
  // ────────────────────────────────────────────────
  function showLoader(text, pct) {
    document.getElementById('loaderTitle').textContent = text;
    document.getElementById('loaderStep').textContent = 'Step 1 of 7';
    document.getElementById('loaderBar').style.width = (pct || 5) + '%';
    document.getElementById('loadingOverlay').classList.add('active');
  }

  function setLoader(text, pct) {
    document.getElementById('loaderTitle').textContent = text;
    document.getElementById('loaderBar').style.width = pct + '%';
  }

  function hideLoader() {
    document.getElementById('loadingOverlay').classList.remove('active');
  }

  function tick(ms = 100) { return new Promise(r => setTimeout(r, ms)); }

})();
