
export const toGB = (val, unit) => {
  const num = Number(val) || 0;
  const u = String(unit || '').toUpperCase().trim();
  if (u === 'TB') return num * 1024;
  if (u === 'GB') return num;
  if (u === 'MB') return num / 1024;
  if (u === 'KB') return num / (1024 * 1024);
  if (u === 'B' || u === 'BYTES') return num / (1024 ** 3);
  if (num > 1000000) return num / (1024 ** 3);
  return num;
};

// Extragere a valorii și unității
export const extractMetric = (data, key) => {
  if (!data || data[key] === undefined || data[key] === null) {
    return { value: 0, units: '' };
  }

  const item = data[key];

  if (typeof item === 'number') {
    return { value: isNaN(item) ? 0 : item, units: '' };
  }

  if (Array.isArray(item) && item.length > 0) {
    const first = item[0];
    if (typeof first === 'number') {
      return { value: isNaN(first) ? 0 : first, units: '' };
    }
    const rawVal = first?.value ?? first?.[key] ?? Object.values(first)[0] ?? 0;
    const parsed = Number(rawVal);
    return {
      value: isNaN(parsed) ? 0 : parsed,
      units: first?.units || ''
    };
  }

  if (typeof item === 'object') {
    const rawVal = item.value ?? item[key] ?? Object.values(item)[0] ?? 0;
    const parsed = Number(rawVal);
    return {
      value: isNaN(parsed) ? 0 : parsed,
      units: item.units || ''
    };
  }

  const parsed = Number(item);
  return { value: isNaN(parsed) ? 0 : parsed, units: '' };
};

// Extrageri pentru serii temporale / grafice
export const extractItemData = (item, key) => {
  if (item === undefined || item === null) return { value: 0, units: '' };
  if (typeof item === 'number') return { value: isNaN(item) ? 0 : item, units: '' };
  if (typeof item === 'object') {
    const raw = item[key] ?? item.value ?? Object.values(item)[1] ?? 0;
    const parsed = Number(raw);
    return {
      value: isNaN(parsed) ? 0 : parsed,
      units: item.units || ''
    };
  }
  const parsed = Number(item);
  return { value: isNaN(parsed) ? 0 : parsed, units: '' };
};

// Plafonare procentuală [0, 100]
export const clampPercent = (val) => {
  const num = Number(val) || 0;
  if (isNaN(num) || num < 0) return 0;
  if (num > 100) return 100;
  return num;
};