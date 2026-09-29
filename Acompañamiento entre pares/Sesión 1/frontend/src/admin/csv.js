const BOM = String.fromCharCode(0xfeff);

export function descargarCSV(nombreArchivo, filas) {
  if (!filas || filas.length === 0) return;

  const columnas = Object.keys(filas[0]);
  const escapar = (valor) => {
    const texto = String(valor ?? '');
    if (/[",\n]/.test(texto)) return `"${texto.replace(/"/g, '""')}"`;
    return texto;
  };

  const lineas = [
    columnas.join(','),
    ...filas.map((fila) => columnas.map((c) => escapar(fila[c])).join(',')),
  ];

  const csv = BOM + lineas.join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  a.click();
  URL.revokeObjectURL(url);
}
