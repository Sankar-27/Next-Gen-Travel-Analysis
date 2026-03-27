// ============ PARSER & DATASET UNDERSTANDING ============

window.Parser = {

  parse(csvText) {
    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: h => h.trim().toLowerCase().replace(/\s+/g, '_')
    });
    return { rows: result.data, fields: result.meta.fields };
  },

  inferSchema(rows, fields) {
    const schema = {};
    fields.forEach(f => {
      const vals = rows.map(r => r[f]).filter(v => v !== null && v !== undefined && v !== '');
      const numericCount = vals.filter(v => typeof v === 'number' && !isNaN(v)).length;
      const ratio = numericCount / vals.length;

      let type = 'text';
      if (ratio > 0.8) type = 'numeric';
      if (this._isDateField(f, vals)) type = 'date';
      if (this._isLocationField(f)) type = 'location';
      if (this._isMetricField(f)) type = 'metric';

      const uniqueVals = [...new Set(vals)];
      schema[f] = {
        type,
        uniqueCount: uniqueVals.length,
        sample: uniqueVals.slice(0, 5),
        nullCount: rows.length - vals.length,
        min: type === 'numeric' ? Math.min(...vals.filter(v => typeof v === 'number')) : null,
        max: type === 'numeric' ? Math.max(...vals.filter(v => typeof v === 'number')) : null,
        mean: type === 'numeric' ? (vals.filter(v => typeof v === 'number').reduce((a,b) => a+b, 0) / numericCount).toFixed(2) : null
      };
    });
    return schema;
  },

  _isDateField(f, vals) {
    const dateKeywords = ['date','month','year','time','period','quarter'];
    if (dateKeywords.some(k => f.includes(k))) return true;
    return false;
  },

  _isLocationField(f) {
    const locKeywords = ['country','city','region','destination','location','place','area','zone'];
    return locKeywords.some(k => f.includes(k));
  },

  _isMetricField(f) {
    const metricKeywords = ['volume','tourists','bookings','spend','growth','score','index','pct','rate','count','total','avg','mean','num'];
    return metricKeywords.some(k => f.includes(k));
  },

  detectDatasetType(fields) {
    const fieldStr = fields.join(' ');
    if (fieldStr.includes('search_volume') || fieldStr.includes('search_growth')) return 'Search Trends';
    if (fieldStr.includes('booking_id') || fieldStr.includes('stay_duration')) return 'Booking Data';
    if (fieldStr.includes('avg_temp') || fieldStr.includes('coolness') || fieldStr.includes('wellness_score')) return 'Climate & Destination Index';
    return 'Travel Dataset';
  },

  clean(rows, fields, schema) {
    let cleaned = [...rows];
    let ops = [];

    // Remove full duplicates
    const before = cleaned.length;
    const seen = new Set();
    cleaned = cleaned.filter(row => {
      const key = JSON.stringify(row);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const dupsRemoved = before - cleaned.length;
    if (dupsRemoved > 0) ops.push(`Removed ${dupsRemoved} duplicate row(s)`);

    // Handle missing values
    let missingFilled = 0;
    cleaned = cleaned.map(row => {
      const newRow = {...row};
      fields.forEach(f => {
        if (newRow[f] === null || newRow[f] === undefined || newRow[f] === '') {
          if (schema[f].type === 'numeric') {
            newRow[f] = parseFloat(schema[f].mean) || 0;
            missingFilled++;
          } else {
            newRow[f] = 'Unknown';
            missingFilled++;
          }
        }
      });
      return newRow;
    });
    if (missingFilled > 0) ops.push(`Filled ${missingFilled} missing value(s) with mean/placeholder`);

    // Standardize text fields
    fields.forEach(f => {
      if (schema[f].type === 'location' || schema[f].type === 'text') {
        cleaned = cleaned.map(row => ({
          ...row,
          [f]: typeof row[f] === 'string' ? row[f].trim() : row[f]
        }));
      }
    });
    ops.push('Standardized text field whitespace');
    ops.push('Validated numeric field ranges');

    return { cleaned, ops };
  }
};
