// ============ STATISTICAL ANALYZER ============

window.Analyzer = {

  runEDA(rows, fields, schema) {
    return {
      rowCount: rows.length,
      fieldCount: fields.length,
      locationFields: fields.filter(f => schema[f].type === 'location'),
      metricFields: fields.filter(f => schema[f].type === 'metric' || schema[f].type === 'numeric'),
      dateFields: fields.filter(f => schema[f].type === 'date'),
      topDestinations: this._topValues(rows, fields, 'destination') ||
                       this._topValues(rows, fields, 'country') || [],
      temporalTrends: this._temporalTrends(rows, fields),
      growthMetrics: this._growthMetrics(rows, fields, schema),
      correlations: this._correlations(rows, fields, schema),
      seasonalPattern: this._seasonalPattern(rows, fields),
      travelTypes: this._travelTypeDistribution(rows, fields),
      spendStats: this._spendStats(rows, fields),
      stayDuration: this._stayDurationStats(rows, fields)
    };
  },

  _topValues(rows, fields, fieldName) {
    const f = fields.find(f => f.includes(fieldName));
    if (!f) return null;
    const counts = {};
    rows.forEach(r => {
      const v = r[f];
      if (v) counts[v] = (counts[v] || 0) + 1;
    });
    return Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0, 10).map(([name, count]) => ({name, count}));
  },

  _temporalTrends(rows, fields) {
    const monthField = fields.find(f => f === 'month');
    const yearField = fields.find(f => f === 'year');
    const volumeField = fields.find(f => f.includes('search_volume') || f.includes('tourists') || f.includes('bookings'));

    if (!monthField && !yearField) return null;

    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    if (monthField && volumeField) {
      const byMonth = {};
      rows.forEach(r => {
        const m = typeof r[monthField] === 'number' ? MONTHS[r[monthField]-1] : r[monthField];
        if (m) {
          byMonth[m] = (byMonth[m] || 0) + (r[volumeField] || 1);
        }
      });
      return { type: 'monthly', data: byMonth };
    }

    if (yearField) {
      const byYear = {};
      rows.forEach(r => {
        const y = r[yearField];
        if (y) byYear[y] = (byYear[y] || 0) + (volumeField ? (r[volumeField] || 1) : 1);
      });
      return { type: 'yearly', data: byYear };
    }

    return null;
  },

  _growthMetrics(rows, fields, schema) {
    const growthField = fields.find(f => f.includes('growth') || f.includes('pct'));
    const destField = fields.find(f => f.includes('destination') || f.includes('country'));
    if (!growthField || !destField) return [];

    const byDest = {};
    rows.forEach(r => {
      const d = r[destField];
      const g = r[growthField];
      if (d && typeof g === 'number') {
        if (!byDest[d]) byDest[d] = [];
        byDest[d].push(g);
      }
    });

    return Object.entries(byDest)
      .map(([dest, vals]) => ({ dest, avgGrowth: (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) }))
      .sort((a,b) => b.avgGrowth - a.avgGrowth)
      .slice(0, 10);
  },

  _correlations(rows, fields, schema) {
    const numFields = fields.filter(f => schema[f].type === 'numeric' || schema[f].type === 'metric').slice(0, 6);
    const corrs = [];
    for (let i = 0; i < numFields.length; i++) {
      for (let j = i+1; j < numFields.length; j++) {
        const a = rows.map(r => r[numFields[i]]).filter(v => typeof v === 'number');
        const b = rows.map(r => r[numFields[j]]).filter(v => typeof v === 'number');
        if (a.length < 3) continue;
        const len = Math.min(a.length, b.length);
        const corr = this._pearson(a.slice(0,len), b.slice(0,len));
        if (Math.abs(corr) > 0.4) {
          corrs.push({ fieldA: numFields[i], fieldB: numFields[j], correlation: corr.toFixed(2) });
        }
      }
    }
    return corrs.sort((a,b) => Math.abs(b.correlation) - Math.abs(a.correlation)).slice(0,5);
  },

  _pearson(a, b) {
    const n = a.length;
    const ma = a.reduce((s,v)=>s+v,0)/n;
    const mb = b.reduce((s,v)=>s+v,0)/n;
    const num = a.reduce((s,v,i)=>s+(v-ma)*(b[i]-mb),0);
    const da = Math.sqrt(a.reduce((s,v)=>s+(v-ma)**2,0));
    const db = Math.sqrt(b.reduce((s,v)=>s+(v-mb)**2,0));
    return da && db ? num/(da*db) : 0;
  },

  _seasonalPattern(rows, fields) {
    const monthField = fields.find(f => f === 'month');
    if (!monthField) return null;
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const counts = new Array(12).fill(0);
    rows.forEach(r => {
      const m = typeof r[monthField] === 'number' ? r[monthField] - 1 : MONTHS.indexOf(r[monthField]);
      if (m >= 0 && m < 12) counts[m]++;
    });
    const peak = counts.indexOf(Math.max(...counts));
    return { monthly: counts, peakMonth: MONTHS[peak] };
  },

  _travelTypeDistribution(rows, fields) {
    const typeField = fields.find(f => f.includes('travel_type') || f.includes('type'));
    if (!typeField) return null;
    const counts = {};
    rows.forEach(r => {
      const v = r[typeField];
      if (v) counts[v] = (counts[v] || 0) + 1;
    });
    return counts;
  },

  _spendStats(rows, fields) {
    const spendField = fields.find(f => f.includes('spend'));
    if (!spendField) return null;
    const vals = rows.map(r => r[spendField]).filter(v => typeof v === 'number' && v > 0);
    if (!vals.length) return null;
    vals.sort((a,b)=>a-b);
    return {
      min: vals[0],
      max: vals[vals.length-1],
      mean: Math.round(vals.reduce((a,b)=>a+b,0)/vals.length),
      median: vals[Math.floor(vals.length/2)]
    };
  },

  _stayDurationStats(rows, fields) {
    const stayField = fields.find(f => f.includes('stay') || f.includes('duration'));
    if (!stayField) return null;
    const vals = rows.map(r => r[stayField]).filter(v => typeof v === 'number' && v > 0);
    if (!vals.length) return null;
    return {
      min: Math.min(...vals),
      max: Math.max(...vals),
      mean: (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1)
    };
  },

  // ============ TREND DETECTION ============
  detectTrends(rows, fields, schema) {
    const travelTypeField = fields.find(f => f.includes('travel_type') || f.includes('type'));
    const destField = fields.find(f => f.includes('destination') || f.includes('country'));
    const growthField = fields.find(f => f.includes('growth') || f.includes('pct'));
    const coolField = fields.find(f => f.includes('cool'));
    const wellnessField = fields.find(f => f.includes('wellness'));
    const filmField = fields.find(f => f.includes('film'));
    const agriField = fields.find(f => f.includes('agri'));
    const stayField = fields.find(f => f.includes('stay') || f.includes('duration'));
    const partySizeField = fields.find(f => f.includes('party_size'));

    const detected = [];

    // Set-Jetting
    const setJetting = this._scoreSetJetting(rows, travelTypeField, filmField, destField, growthField);
    if (setJetting.score > 20) detected.push({ ...setJetting, trend: 'Set-Jetting', icon: '🎬', badgeClass: 'badge-setjetting' });

    // Coolcations
    const coolcation = this._scoreCoolcation(rows, travelTypeField, coolField, destField, growthField);
    if (coolcation.score > 20) detected.push({ ...coolcation, trend: 'Coolcations', icon: '❄️', badgeClass: 'badge-coolcation' });

    // Slow Travel
    const slowTravel = this._scoreSlowTravel(rows, travelTypeField, stayField, growthField);
    if (slowTravel.score > 20) detected.push({ ...slowTravel, trend: 'Slow Travel', icon: '🐢', badgeClass: 'badge-slowtravel' });

    // Wellness Tourism
    const wellness = this._scoreWellness(rows, travelTypeField, wellnessField, growthField);
    if (wellness.score > 20) detected.push({ ...wellness, trend: 'Wellness Tourism', icon: '🧘', badgeClass: 'badge-wellness' });

    // Agritourism
    const agri = this._scoreAgritourism(rows, travelTypeField, agriField, growthField);
    if (agri.score > 20) detected.push({ ...agri, trend: 'Agritourism', icon: '🌾', badgeClass: 'badge-agritourism' });

    // Multi-Generational
    const multiGen = this._scoreMultiGen(rows, travelTypeField, partySizeField, growthField);
    if (multiGen.score > 20) detected.push({ ...multiGen, trend: 'Multi-Generational Travel', icon: '👨‍👩‍👧‍👦', badgeClass: 'badge-multigen' });

    // Emerging destinations
    const emerging = this._scoreEmerging(rows, fields, growthField, destField);
    if (emerging.score > 20) detected.push({ ...emerging, trend: 'Emerging Destinations', icon: '🌟', badgeClass: 'badge-emerging' });

    return detected.sort((a,b) => b.score - a.score);
  },

  _scoreSetJetting(rows, typeField, filmField, destField, growthField) {
    let score = 0; const evidence = [];
    const setJettingDests = ['dubrovnik','new zealand','iceland','kyoto','northern ireland','scotland','peru','jordan','morocco'];

    if (typeField) {
      const sjRows = rows.filter(r => r[typeField] && r[typeField].toString().toLowerCase().includes('set'));
      if (sjRows.length > 0) { score += 40; evidence.push(`${sjRows.length} records tagged as Set-Jetting travel`); }
    }
    if (filmField) {
      const vals = rows.map(r => r[filmField]).filter(v => typeof v === 'number');
      if (vals.length) { const avg = vals.reduce((a,b)=>a+b,0)/vals.length; if (avg > 5) { score += 20; evidence.push(`Avg ${avg.toFixed(0)} film productions per destination`); } }
    }
    if (destField) {
      const hits = rows.filter(r => setJettingDests.some(d => r[destField] && r[destField].toString().toLowerCase().includes(d)));
      if (hits.length > 0) { score += 15; evidence.push(`${hits.length} records match known Set-Jetting destinations`); }
    }
    if (growthField) {
      const sjGrowth = rows.filter(r => r[growthField] > 80);
      if (sjGrowth.length > 0) { score += 15; evidence.push(`${sjGrowth.length} destinations show >80% search growth`); }
    }
    return { score: Math.min(score, 100), evidence, confidence: score > 60 ? 'High' : score > 35 ? 'Medium' : 'Low',
      description: 'Travel motivated by film & TV filming locations. High search growth correlates with popular productions.' };
  },

  _scoreCoolcation(rows, typeField, coolField, destField, growthField) {
    let score = 0; const evidence = [];
    const coolDests = ['iceland','norway','scotland','alaska','faroe','patagonia','canada','finland','sweden','hokkaido','new zealand'];

    if (typeField) {
      const cRows = rows.filter(r => r[typeField] && r[typeField].toString().toLowerCase().includes('cool'));
      if (cRows.length > 0) { score += 40; evidence.push(`${cRows.length} records tagged as Coolcation travel`); }
    }
    if (coolField) {
      const vals = rows.map(r => r[coolField]).filter(v => typeof v === 'number' && v > 0);
      if (vals.length) { const avg = vals.reduce((a,b)=>a+b,0)/vals.length; if (avg > 70) { score += 25; evidence.push(`Avg coolness index of ${avg.toFixed(0)}/100`); } }
    }
    if (destField) {
      const hits = rows.filter(r => coolDests.some(d => r[destField] && r[destField].toString().toLowerCase().includes(d)));
      if (hits.length > 0) { score += 20; evidence.push(`${hits.length} records match cool-climate destinations`); }
    }
    if (growthField) {
      const highGrowth = rows.filter(r => r[growthField] > 30);
      if (highGrowth.length > 0) { score += 15; evidence.push(`${highGrowth.length} destinations showing strong growth`); }
    }
    return { score: Math.min(score, 100), evidence, confidence: score > 60 ? 'High' : score > 35 ? 'Medium' : 'Low',
      description: 'Travel to cooler destinations as an escape from heat. Driven by climate change awareness and overtourism at traditional hotspots.' };
  },

  _scoreSlowTravel(rows, typeField, stayField, growthField) {
    let score = 0; const evidence = [];

    if (typeField) {
      const stRows = rows.filter(r => r[typeField] && r[typeField].toString().toLowerCase().includes('slow'));
      if (stRows.length > 0) { score += 40; evidence.push(`${stRows.length} records tagged as Slow Travel`); }
    }
    if (stayField) {
      const vals = rows.map(r => r[stayField]).filter(v => typeof v === 'number' && v > 0);
      if (vals.length) {
        const avg = vals.reduce((a,b)=>a+b,0)/vals.length;
        if (avg > 10) { score += 30; evidence.push(`Avg stay duration of ${avg.toFixed(1)} days — above typical threshold`); }
        else if (avg > 7) { score += 15; evidence.push(`Avg stay duration of ${avg.toFixed(1)} days`); }
      }
    }
    return { score: Math.min(score, 100), evidence, confidence: score > 60 ? 'High' : score > 35 ? 'Medium' : 'Low',
      description: 'Immersive, long-duration travel focused on cultural depth over breadth. Extended stays at single destinations signal this trend.' };
  },

  _scoreWellness(rows, typeField, wellnessField, growthField) {
    let score = 0; const evidence = [];
    const wellnessDests = ['bali','costa rica','kerala','chiang mai','bhutan','ubud','sedona','tulum'];

    if (typeField) {
      const wRows = rows.filter(r => r[typeField] && r[typeField].toString().toLowerCase().includes('wellness'));
      if (wRows.length > 0) { score += 40; evidence.push(`${wRows.length} records tagged as Wellness Tourism`); }
    }
    if (wellnessField) {
      const vals = rows.map(r => r[wellnessField]).filter(v => typeof v === 'number' && v > 0);
      if (vals.length) { const avg = vals.reduce((a,b)=>a+b,0)/vals.length; if (avg > 75) { score += 25; evidence.push(`High avg wellness score: ${avg.toFixed(0)}/100`); } }
    }
    const destField2 = rows[0] ? Object.keys(rows[0]).find(k => k.includes('destination') || k.includes('country')) : null;
    if (destField2) {
      const hits = rows.filter(r => wellnessDests.some(d => r[destField2] && r[destField2].toString().toLowerCase().includes(d)));
      if (hits.length > 0) { score += 20; evidence.push(`${hits.length} records match top wellness destinations`); }
    }
    return { score: Math.min(score, 100), evidence, confidence: score > 60 ? 'High' : score > 35 ? 'Medium' : 'Low',
      description: 'Travel centered on mental, physical and spiritual wellbeing. Spa resorts, yoga retreats, and eco-wellness lodges are growing rapidly.' };
  },

  _scoreAgritourism(rows, typeField, agriField, growthField) {
    let score = 0; const evidence = [];
    const agriDests = ['tuscany','provence','alentejo','oaxaca','georgia','napa','douro','burgundy'];

    if (typeField) {
      const aRows = rows.filter(r => r[typeField] && r[typeField].toString().toLowerCase().includes('agri'));
      if (aRows.length > 0) { score += 40; evidence.push(`${aRows.length} records tagged as Agritourism`); }
    }
    if (agriField) {
      const vals = rows.map(r => r[agriField]).filter(v => typeof v === 'number' && v > 0);
      if (vals.length) { const avg = vals.reduce((a,b)=>a+b,0)/vals.length; if (avg > 70) { score += 25; evidence.push(`High agri-tourism score: ${avg.toFixed(0)}/100`); } }
    }
    const destField3 = rows[0] ? Object.keys(rows[0]).find(k => k.includes('destination') || k.includes('country')) : null;
    if (destField3) {
      const hits = rows.filter(r => agriDests.some(d => r[destField3] && r[destField3].toString().toLowerCase().includes(d)));
      if (hits.length > 0) { score += 20; evidence.push(`${hits.length} records match key agritourism destinations`); }
    }
    return { score: Math.min(score, 100), evidence, confidence: score > 60 ? 'High' : score > 35 ? 'Medium' : 'Low',
      description: 'Farm stays, vineyard tourism, and rural culinary experiences. Demand for authentic, hands-on food and nature experiences is surging.' };
  },

  _scoreMultiGen(rows, typeField, partySizeField, growthField) {
    let score = 0; const evidence = [];

    if (typeField) {
      const mgRows = rows.filter(r => r[typeField] && r[typeField].toString().toLowerCase().includes('multi'));
      if (mgRows.length > 0) { score += 40; evidence.push(`${mgRows.length} records tagged as Multi-Generational Travel`); }
    }
    if (partySizeField) {
      const vals = rows.map(r => r[partySizeField]).filter(v => typeof v === 'number');
      if (vals.length) {
        const avg = vals.reduce((a,b)=>a+b,0)/vals.length;
        const large = vals.filter(v => v >= 5).length;
        if (avg > 3.5) { score += 25; evidence.push(`Avg party size of ${avg.toFixed(1)} people`); }
        if (large > 0) { score += 20; evidence.push(`${large} bookings with 5+ people in party`); }
      }
    }
    return { score: Math.min(score, 100), evidence, confidence: score > 60 ? 'High' : score > 35 ? 'Medium' : 'Low',
      description: 'Family travel spanning multiple generations (grandparents to grandchildren). Demand for villa rentals and activity-diverse destinations is high.' };
  },

  _scoreEmerging(rows, fields, growthField, destField) {
    let score = 0; const evidence = [];
    const emergingDests = ['slovenia','azores','georgia','faroe','albania','moldova','bhutan','oman','rwanda','uzbekistan'];

    if (destField) {
      const hits = rows.filter(r => emergingDests.some(d => r[destField] && r[destField].toString().toLowerCase().includes(d)));
      if (hits.length > 0) { score += 30; evidence.push(`${hits.length} records match emerging destination hotspots`); }
    }
    if (growthField) {
      const highGrowth = rows.filter(r => r[growthField] > 40);
      if (highGrowth.length > 0) { score += 30; evidence.push(`${highGrowth.length} destinations with >40% growth signal emerging interest`); }
    }
    // Check for 'emerging' type tag
    const typeF = fields.find(f => f.includes('type'));
    if (typeF) {
      const eRows = rows.filter(r => r[typeF] && r[typeF].toString().toLowerCase().includes('emerging'));
      if (eRows.length > 0) { score += 25; evidence.push(`${eRows.length} records explicitly tagged as emerging`); }
    }
    return { score: Math.min(score, 100), evidence, confidence: score > 60 ? 'High' : score > 35 ? 'Medium' : 'Low',
      description: 'Up-and-coming destinations gaining rapid tourist interest, often driven by low crowds, authenticity, and affordability.' };
  },

  // ============ INSIGHT GENERATION ============
  generateInsights(eda, trends, rows, fields) {
    const insights = [];

    // Growth insight
    if (eda.growthMetrics && eda.growthMetrics.length > 0) {
      const top = eda.growthMetrics[0];
      insights.push({ type: 'Growth Leader', color: 'primary',
        text: `${top.dest} is the fastest-growing destination in this dataset with an average growth of ${top.avgGrowth}%. This represents a high-priority market for early investment and destination marketing.` });
    }

    // Trend insight
    if (trends.length > 0) {
      const top2 = trends.slice(0,2).map(t=>t.trend).join(' and ');
      insights.push({ type: 'Dominant Trends', color: 'amber',
        text: `${top2} emerge as the dominant travel patterns. These trends reflect a global shift away from mass tourism toward purpose-driven, experience-led travel behaviors.` });
    }

    // Seasonal insight
    if (eda.seasonalPattern) {
      insights.push({ type: 'Seasonality', color: 'green',
        text: `Peak travel demand clusters around ${eda.seasonalPattern.peakMonth}. Shoulder season opportunities exist for destinations that can diversify their year-round appeal through curated experiences.` });
    }

    // Stay duration insight
    if (eda.stayDuration && parseFloat(eda.stayDuration.mean) > 10) {
      insights.push({ type: 'Slow Travel Signal', color: 'violet',
        text: `Average stay duration of ${eda.stayDuration.mean} days significantly exceeds global average of 6–7 days. This is a strong indicator of slow travel preference — high-value, long-stay travelers who spend more per trip.` });
    }

    // Spend insight
    if (eda.spendStats) {
      insights.push({ type: 'Spending Behavior', color: 'primary',
        text: `Average trip spend of $${eda.spendStats.mean.toLocaleString()} USD. The spend range ($${eda.spendStats.min} – $${eda.spendStats.max}) suggests a diverse traveler mix from budget-conscious to premium segments.` });
    }

    // Coolcation / climate insight
    if (trends.find(t => t.trend === 'Coolcations')) {
      insights.push({ type: 'Climate-Driven Travel', color: 'amber',
        text: `Cool-climate destination demand is accelerating. As global temperatures rise, travelers are actively seeking alternatives to traditional sun-and-beach destinations — Scandinavia, Patagonia, and North Atlantic islands show the highest growth rates.` });
    }

    // Correlation insight
    if (eda.correlations && eda.correlations.length > 0) {
      const c = eda.correlations[0];
      const strength = Math.abs(c.correlation) > 0.7 ? 'strong' : 'moderate';
      insights.push({ type: 'Data Correlation', color: 'green',
        text: `A ${strength} correlation (r=${c.correlation}) detected between "${c.fieldA.replace(/_/g,' ')}" and "${c.fieldB.replace(/_/g,' ')}". This relationship can be leveraged for predictive demand modeling.` });
    }

    return insights;
  }
};
