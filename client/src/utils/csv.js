export const parseCsv = text => {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;
  const source = String(text || '').replace(/^\uFEFF/, '');

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (char === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(value.trim());
      value = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(value.trim());
      value = '';
      if (row.some(cell => cell !== '')) rows.push(row);
      row = [];
    } else {
      value += char;
    }
  }

  row.push(value.trim());
  if (row.some(cell => cell !== '')) rows.push(row);
  if (rows.length < 2) return [];

  const headers = rows[0].map(header => header.trim());
  return rows.slice(1).map(cells =>
    headers.reduce((result, header, index) => {
      result[header] = cells[index] ?? '';
      return result;
    }, {})
  );
};

const escapeCell = value => `"${String(value ?? '').replace(/"/g, '""')}"`;

export const downloadCsvTemplate = (filename, headers, examples = []) => {
  const content = [
    headers.map(escapeCell).join(','),
    ...examples.map(row => headers.map(header => escapeCell(row[header])).join(',')),
  ].join('\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
