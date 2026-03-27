// ============ CHART RENDERER — Light Theme ============

window.Charts = {
  PALETTE: ['#327D81','#13294B','#3d9499','#1e3d6e','#c89b3c','#5a9e7a','#9b6b9b','#e07050','#4a7fb5','#7aab6e'],

  _defaults() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#4a6080', font: { family: 'DM Mono', size: 10 }, boxWidth: 12 } },
        tooltip: {
          backgroundColor: '#13294B',
          borderColor: 'rgba(50,125,129,0.3)',
          borderWidth: 1,
          titleColor: '#FFFFFF',
          bodyColor: 'rgba(255,255,255,0.7)',
          titleFont: { family: 'Cormorant Garamond', size: 13 },
          bodyFont: { family: 'DM Mono', size: 10 }
        }
      },
      scales: {
        x: { ticks: { color: '#7a90a8', font: { family: 'DM Mono', size: 9 } }, grid: { color: 'rgba(19,41,75,0.06)' } },
        y: { ticks: { color: '#7a90a8', font: { family: 'DM Mono', size: 9 } }, grid: { color: 'rgba(19,41,75,0.06)' } }
      }
    };
  },

  destroy(id) { const c = Chart.getChart(id); if (c) c.destroy(); },

  renderLine(id, labels, datasets) {
    this.destroy(id);
    const ctx = document.getElementById(id).getContext('2d');
    return new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: datasets.map((ds, i) => ({
        label: ds.label, data: ds.data,
        borderColor: this.PALETTE[i % this.PALETTE.length],
        backgroundColor: this.PALETTE[i % this.PALETTE.length] + '18',
        borderWidth: 2.5, pointRadius: 3.5, tension: 0.4,
        fill: datasets.length === 1, pointHoverRadius: 5
      })) },
      options: { ...this._defaults() }
    });
  },

  renderBar(id, labels, data, label) {
    this.destroy(id);
    const ctx = document.getElementById(id).getContext('2d');
    return new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ label, data,
        backgroundColor: labels.map((_, i) => this.PALETTE[i % this.PALETTE.length] + 'cc'),
        borderColor: labels.map((_, i) => this.PALETTE[i % this.PALETTE.length]),
        borderWidth: 1.5, borderRadius: 5, borderSkipped: false }] },
      options: { ...this._defaults() }
    });
  },

  renderHorizontalBar(id, labels, data, label) {
    this.destroy(id);
    const ctx = document.getElementById(id).getContext('2d');
    return new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ label, data,
        backgroundColor: labels.map((_, i) => this.PALETTE[i % this.PALETTE.length] + 'cc'),
        borderColor: labels.map((_, i) => this.PALETTE[i % this.PALETTE.length]),
        borderWidth: 1.5, borderRadius: 4 }] },
      options: {
        ...this._defaults(), indexAxis: 'y',
        scales: {
          x: { ticks: { color: '#7a90a8', font: { family: 'DM Mono', size: 9 } }, grid: { color: 'rgba(19,41,75,0.06)' } },
          y: { ticks: { color: '#4a6080', font: { family: 'DM Mono', size: 9 } }, grid: { display: false } }
        }
      }
    });
  },

  renderDoughnut(id, labels, data) {
    this.destroy(id);
    const ctx = document.getElementById(id).getContext('2d');
    return new Chart(ctx, {
      type: 'doughnut',
      data: { labels, datasets: [{ data,
        backgroundColor: this.PALETTE.slice(0, labels.length).map(c => c + 'cc'),
        borderColor: this.PALETTE.slice(0, labels.length), borderWidth: 1.5 }] },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '60%',
        plugins: {
          legend: { position: 'right', labels: { color: '#4a6080', font: { family: 'DM Mono', size: 9 }, boxWidth: 10, padding: 10 } },
          tooltip: this._defaults().plugins.tooltip
        }
      }
    });
  },

  renderScatter(id, points, xLabel, yLabel) {
    this.destroy(id);
    const ctx = document.getElementById(id).getContext('2d');
    return new Chart(ctx, {
      type: 'scatter',
      data: { datasets: [{ label: `${xLabel} vs ${yLabel}`, data: points,
        backgroundColor: '#327D8180', borderColor: '#327D81', borderWidth: 1.5, pointRadius: 5 }] },
      options: {
        ...this._defaults(),
        plugins: { ...this._defaults().plugins, legend: { display: false } },
        scales: {
          x: { ...this._defaults().scales.x, title: { display: true, text: xLabel, color: '#7a90a8', font: { size: 9 } } },
          y: { ...this._defaults().scales.y, title: { display: true, text: yLabel, color: '#7a90a8', font: { size: 9 } } }
        }
      }
    });
  },

  renderRadar(id, labels, datasets) {
    this.destroy(id);
    const ctx = document.getElementById(id).getContext('2d');
    return new Chart(ctx, {
      type: 'radar',
      data: { labels, datasets: datasets.map((ds, i) => ({
        label: ds.label, data: ds.data,
        borderColor: this.PALETTE[i % this.PALETTE.length],
        backgroundColor: this.PALETTE[i % this.PALETTE.length] + '20',
        pointBackgroundColor: this.PALETTE[i % this.PALETTE.length],
        borderWidth: 2, pointRadius: 3
      })) },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: { r: {
          ticks: { color: '#7a90a8', font: { size: 8 }, backdropColor: 'transparent' },
          grid: { color: 'rgba(19,41,75,0.08)' },
          angleLines: { color: 'rgba(19,41,75,0.10)' },
          pointLabels: { color: '#4a6080', font: { family: 'DM Mono', size: 9 } }
        }},
        plugins: { legend: { labels: { color: '#4a6080', font: { family: 'DM Mono', size: 10 }, boxWidth: 10 } }, tooltip: this._defaults().plugins.tooltip }
      }
    });
  },

  renderStackedBar(id, labels, datasets) {
    this.destroy(id);
    const ctx = document.getElementById(id).getContext('2d');
    return new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: datasets.map((ds, i) => ({
        label: ds.label, data: ds.data,
        backgroundColor: this.PALETTE[i % this.PALETTE.length] + 'cc',
        borderColor: this.PALETTE[i % this.PALETTE.length], borderWidth: 1, borderRadius: 2
      })) },
      options: {
        ...this._defaults(),
        scales: {
          x: { ...this._defaults().scales.x, stacked: true },
          y: { ...this._defaults().scales.y, stacked: true }
        }
      }
    });
  },

  buildEDACharts(container, eda, rows, fields) {
    let html = '<div class="section-title">Visualisations</div><div class="section-sub">Interactive charts generated from your dataset</div>';

    // Row 1: temporal + destinations
    let row1 = '';
    if (eda.temporalTrends) row1 += `<div class="chart-card"><div class="chart-card-title">Tourism Volume Over Time</div><div class="chart-wrap"><canvas id="chartTemporal"></canvas></div></div>`;
    if (eda.topDestinations?.length) row1 += `<div class="chart-card"><div class="chart-card-title">Top Destinations by Volume</div><div class="chart-wrap"><canvas id="chartDests"></canvas></div></div>`;
    if (row1) html += `<div class="chart-grid-2">${row1}</div>`;

    // Row 2: travel types + seasonal
    let row2 = '';
    if (eda.travelTypes) row2 += `<div class="chart-card"><div class="chart-card-title">Travel Type Distribution</div><div class="chart-wrap"><canvas id="chartTypes"></canvas></div></div>`;
    if (eda.seasonalPattern) row2 += `<div class="chart-card"><div class="chart-card-title">Monthly Demand Pattern</div><div class="chart-wrap"><canvas id="chartSeasonal"></canvas></div></div>`;
    if (eda.growthMetrics?.length) row2 += `<div class="chart-card"><div class="chart-card-title">Destination Growth Rate (%)</div><div class="chart-wrap"><canvas id="chartGrowth"></canvas></div></div>`;
    if (row2) html += `<div class="chart-grid-3">${row2}</div>`;

    // Row 3: horizontal bar (destinations) + scatter
    let row3 = '';
    if (eda.topDestinations?.length) row3 += `<div class="chart-card"><div class="chart-card-title">Destination Ranking (Horizontal)</div><div class="chart-wrap chart-wrap-tall"><canvas id="chartDestsH"></canvas></div></div>`;
    if (eda.correlations?.length) row3 += `<div class="chart-card"><div class="chart-card-title">Correlation: ${eda.correlations[0].fieldA.replace(/_/g,' ')} vs ${eda.correlations[0].fieldB.replace(/_/g,' ')}</div><div class="chart-wrap chart-wrap-tall"><canvas id="chartScatter"></canvas></div></div>`;
    if (row3) html += `<div class="chart-grid-2">${row3}</div>`;

    // Correlation analysis block
    if (eda.correlations?.length) {
      html += `<div class="corr-table block-title" style="margin-bottom:8px">Correlation Analysis</div>
        <div class="corr-table">
          ${eda.correlations.map(c => `
            <div class="corr-row">
              <span class="corr-label">${c.fieldA.replace(/_/g,' ')} ↔ ${c.fieldB.replace(/_/g,' ')}</span>
              <div class="corr-bar-wrap"><div class="corr-bar-fill ${c.correlation < 0 ? 'neg' : ''}" style="width:${Math.abs(c.correlation)*100}%"></div></div>
              <span class="corr-val ${c.correlation < 0 ? '' : ''}" style="color:${c.correlation >= 0 ? 'var(--teal-dark)' : '#9a7020'}">${c.correlation > 0 ? '▲' : '▼'} ${c.correlation}</span>
            </div>`).join('')}
        </div>`;
    }

    container.innerHTML = html;

    requestAnimationFrame(() => {
      const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      if (eda.temporalTrends && document.getElementById('chartTemporal')) {
        const d = eda.temporalTrends.data;
        this.renderLine('chartTemporal', Object.keys(d), [{ label: 'Volume', data: Object.values(d) }]);
      }
      if (eda.topDestinations && document.getElementById('chartDests')) {
        this.renderBar('chartDests', eda.topDestinations.map(d=>d.name), eda.topDestinations.map(d=>d.count), 'Count');
      }
      if (eda.topDestinations && document.getElementById('chartDestsH')) {
        this.renderHorizontalBar('chartDestsH', eda.topDestinations.map(d=>d.name), eda.topDestinations.map(d=>d.count), 'Records');
      }
      if (eda.travelTypes && document.getElementById('chartTypes')) {
        const t = eda.travelTypes;
        this.renderDoughnut('chartTypes', Object.keys(t), Object.values(t));
      }
      if (eda.growthMetrics?.length && document.getElementById('chartGrowth')) {
        this.renderBar('chartGrowth', eda.growthMetrics.map(g=>g.dest), eda.growthMetrics.map(g=>parseFloat(g.avgGrowth)), 'Avg Growth %');
      }
      if (eda.seasonalPattern && document.getElementById('chartSeasonal')) {
        this.renderBar('chartSeasonal', MONTHS, eda.seasonalPattern.monthly, 'Records');
      }
      if (eda.correlations?.length && document.getElementById('chartScatter')) {
        const c = eda.correlations[0];
        const pts = rows.map(r => ({ x: r[c.fieldA], y: r[c.fieldB] })).filter(p => typeof p.x === 'number' && typeof p.y === 'number');
        this.renderScatter('chartScatter', pts, c.fieldA.replace(/_/g,' '), c.fieldB.replace(/_/g,' '));
      }
    });
  },

  buildTrendRadar(container, trends) {
    if (!trends?.length) return;
    container.innerHTML = `<div class="chart-card" style="margin-top:24px"><div class="chart-card-title">Trend Strength Radar</div><div class="chart-wrap" style="height:320px"><canvas id="chartTrendRadar"></canvas></div></div>`;
    requestAnimationFrame(() => {
      this.renderRadar('chartTrendRadar', trends.map(t=>t.trend), [{ label: 'Confidence Score', data: trends.map(t=>t.score) }]);
    });
  }
};
