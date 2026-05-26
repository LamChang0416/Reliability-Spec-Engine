// ─── Physical Boundary Validator ──────────────────────────────────────────
// Validates test parameters against physical plausibility limits
// Returns an array of {level: 'warn'|'error', msg: string}

export function validateParams(stdKey, params) {
  const warnings = [];
  
  for (const [key, val] of Object.entries(params)) {
    const kl = key.toLowerCase();
    const sv = String(val);
    
    // Extract numeric values from strings
    const nums = sv.match(/-?\d+(?:\.\d+)?/g);
    if (!nums) continue;
    const values = nums.map(Number);
    
    // ── Temperature checks ──
    if (kl.includes('temp') || kl.includes('°c') || sv.includes('°C')) {
      values.forEach(v => {
        if (v < -273.15) {
          warnings.push({ level: 'error', msg: `${key}: ${v}°C is below absolute zero (-273.15°C)` });
        }
        if (v > 1500) {
          warnings.push({ level: 'warn', msg: `${key}: ${v}°C is extremely high — verify this is correct` });
        }
      });
    }
    
    // ── Vibration Grms checks ──
    if (kl.includes('grms') || kl.includes('g rms')) {
      values.forEach(v => {
        if (v < 0) warnings.push({ level: 'error', msg: `${key}: Grms cannot be negative (${v})` });
        if (v > 100) warnings.push({ level: 'warn', msg: `${key}: ${v} Grms is unusually high — verify test level` });
      });
    }
    
    // ── Acceleration checks ──
    if (kl.includes('accel') && kl.includes('peak')) {
      values.forEach(v => {
        if (v < 0) warnings.push({ level: 'error', msg: `${key}: Peak acceleration cannot be negative` });
        if (v > 200) warnings.push({ level: 'warn', msg: `${key}: ${v}g peak acceleration is extremely high` });
      });
    }
    
    // ── Frequency checks ──
    if (kl.includes('freq') || kl.includes('hz')) {
      values.forEach(v => {
        if (v < 0) warnings.push({ level: 'error', msg: `${key}: Frequency cannot be negative (${v} Hz)` });
        if (v > 100000) warnings.push({ level: 'warn', msg: `${key}: ${v} Hz exceeds typical test range` });
      });
    }
    
    // ── Drop height checks ──
    if (kl.includes('drop') && (kl.includes('height') || kl.includes('cm') || kl.includes('inch'))) {
      values.forEach(v => {
        if (v < 0) warnings.push({ level: 'error', msg: `${key}: Drop height cannot be negative` });
        if (v > 300) warnings.push({ level: 'warn', msg: `${key}: ${v} cm drop height seems very high` });
      });
    }
    
    // ── Humidity checks ──
    if (kl.includes('humid') || kl.includes('rh')) {
      values.forEach(v => {
        if (v < 0) warnings.push({ level: 'error', msg: `${key}: Humidity cannot be negative (${v}%)` });
        if (v > 100) warnings.push({ level: 'warn', msg: `${key}: ${v}% RH exceeds 100%` });
      });
    }
    
    // ── Pressure / Load checks ──
    if (kl.includes('load') || kl.includes('pressure') || kl.includes('force')) {
      values.forEach(v => {
        if (v < 0) warnings.push({ level: 'warn', msg: `${key}: Negative load/pressure (${v}) — verify direction convention` });
      });
    }
    
    // ── Duration checks ──
    if (kl.includes('duration') && kl.includes('hour')) {
      values.forEach(v => {
        if (v < 0) warnings.push({ level: 'error', msg: `${key}: Duration cannot be negative` });
        if (v > 10000) warnings.push({ level: 'warn', msg: `${key}: ${v} hours is over 1 year — verify duration` });
      });
    }
  }
  
  return warnings;
}
