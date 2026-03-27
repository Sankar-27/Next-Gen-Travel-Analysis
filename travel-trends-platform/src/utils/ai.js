// ============ CLAUDE AI ENGINE ============

window.AIEngine = {

  API_URL: 'https://api.anthropic.com/v1/messages',

  async generateInsights(datasetSummary, eda, trends) {
    const prompt = this._buildPrompt(datasetSummary, eda, trends);
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await response.json();
      const text = data.content?.map(c => c.text || '').join('') || '';
      return this._parseAIResponse(text);
    } catch (e) {
      return this._fallbackInsights(eda, trends);
    }
  },

  async generateRecommendations(datasetSummary, trends, insights) {
    const prompt = this._buildRecoPrompt(datasetSummary, trends);
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await response.json();
      const text = data.content?.map(c => c.text || '').join('') || '';
      return this._parseRecoResponse(text);
    } catch (e) {
      return this._fallbackRecommendations(trends);
    }
  },

  _buildPrompt(summary, eda, trends) {
    return `You are an expert Travel Trends Data Scientist. Analyze this tourism dataset summary and provide 4-5 key intelligence insights.

Dataset: ${summary.name} (${summary.rowCount} records, ${summary.fieldCount} fields)
Dataset Type: ${summary.datasetType}
Top Destinations: ${eda.topDestinations?.slice(0,5).map(d=>d.name).join(', ') || 'N/A'}
Detected Trends: ${trends.map(t=>t.trend).join(', ') || 'None'}
Avg Stay Duration: ${eda.stayDuration?.mean || 'N/A'} days
Fastest Growing: ${eda.growthMetrics?.[0]?.dest || 'N/A'} (+${eda.growthMetrics?.[0]?.avgGrowth || 0}%)
Seasonal Peak: ${eda.seasonalPattern?.peakMonth || 'N/A'}
Travel Types Present: ${Object.keys(eda.travelTypes || {}).join(', ') || 'N/A'}

Respond in JSON format ONLY (no markdown, no backticks):
{"insights": [{"type": "string", "color": "primary|amber|green|violet", "text": "2-3 sentence analytical insight"}]}

Focus on: emerging opportunities, demand shifts, seasonal behaviors, destination intelligence, traveler behavior patterns. Be specific and data-driven.`;
  },

  _buildRecoPrompt(summary, trends) {
    return `You are a senior Travel Industry Strategist. Based on this tourism analysis, provide strategic business recommendations.

Dataset: ${summary.name}
Top Detected Trends: ${trends.slice(0,4).map(t=>`${t.trend} (${t.confidence} confidence)`).join(', ')}
Dataset Type: ${summary.datasetType}

Respond in JSON format ONLY (no markdown, no backticks):
{"recommendations": [
  {"audience": "Travel Companies", "icon": "✈️", "points": ["3-4 specific action items"]},
  {"audience": "Tourism Boards", "icon": "🏛️", "points": ["3-4 specific action items"]},
  {"audience": "Travel Startups", "icon": "🚀", "points": ["3-4 specific action items"]},
  {"audience": "DMOs", "icon": "📍", "points": ["3-4 specific action items"]}
]}

Make recommendations specific to the detected trends. Include marketing strategies, product opportunities, and destination promotion tactics.`;
  },

  _parseAIResponse(text) {
    try {
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      return parsed.insights || [];
    } catch (e) {
      return this._extractInsightsFromText(text);
    }
  },

  _parseRecoResponse(text) {
    try {
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      return parsed.recommendations || [];
    } catch (e) {
      return [];
    }
  },

  _extractInsightsFromText(text) {
    const lines = text.split('\n').filter(l => l.trim().length > 30);
    return lines.slice(0, 5).map((line, i) => ({
      type: ['Market Intelligence', 'Trend Analysis', 'Growth Signal', 'Behavioral Insight', 'Opportunity'][i] || 'Insight',
      color: ['primary', 'amber', 'green', 'violet', 'primary'][i] || 'primary',
      text: line.replace(/^[•\-\d\.]+\s*/, '').trim()
    }));
  },

  _fallbackInsights(eda, trends) {
    const insights = [];
    if (trends[0]) {
      insights.push({ type: 'Dominant Trend', color: 'primary',
        text: `${trends[0].trend} emerges as the primary travel pattern with ${trends[0].confidence} confidence. ${trends[0].description}` });
    }
    if (eda.growthMetrics?.[0]) {
      insights.push({ type: 'Growth Leader', color: 'amber',
        text: `${eda.growthMetrics[0].dest} leads destination growth at +${eda.growthMetrics[0].avgGrowth}%, signaling an emerging high-value tourism market worth early positioning.` });
    }
    if (eda.seasonalPattern) {
      insights.push({ type: 'Seasonal Intelligence', color: 'green',
        text: `Peak demand concentrates in ${eda.seasonalPattern.peakMonth}. Shoulder season strategy can unlock 15-30% additional yield for flexible destinations.` });
    }
    if (eda.stayDuration?.mean > 10) {
      insights.push({ type: 'Long-Stay Trend', color: 'violet',
        text: `Average ${eda.stayDuration.mean}-day stays exceed global norms, indicating high-value slow travelers who contribute disproportionately to local economies.` });
    }
    return insights;
  },

  _fallbackRecommendations(trends) {
    const trendNames = trends.slice(0,3).map(t=>t.trend).join(', ');
    return [
      { audience: 'Travel Companies', icon: '✈️', points: [
        `Build curated packages targeting ${trends[0]?.trend || 'emerging'} travelers`,
        'Invest in long-stay accommodation partnerships for slow travel market',
        'Develop shoulder-season promotions to spread demand year-round',
        'Create loyalty programs that reward experiential over transactional travel'
      ]},
      { audience: 'Tourism Boards', icon: '🏛️', points: [
        `Position destination around ${trendNames} to attract high-value visitors`,
        'Develop off-peak incentives and cool-season campaigns',
        'Create authentic storytelling content for social/digital channels',
        'Partner with streaming platforms for destination placement opportunities'
      ]},
      { audience: 'Travel Startups', icon: '🚀', points: [
        'Build a discovery platform for emerging and under-the-radar destinations',
        'Create AI-powered itinerary tools optimized for slow travel preferences',
        'Develop wellness travel booking platform with verified eco-credentials',
        'Build multi-generational trip planning tools with cross-age activity matching'
      ]},
      { audience: 'DMOs', icon: '📍', points: [
        'Launch awareness campaigns in high-growth source markets',
        'Create digital content targeting each detected travel trend segment',
        'Build agritourism and rural experience directories for authentic travelers',
        'Develop climate storytelling campaigns that reframe cool-season travel as premium'
      ]}
    ];
  }
};
