import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function exportTruckDataToExcel(truck, month, entries) {
  const filtered = entries.filter(e => e.truck === truck && e.date?.includes('/'));
  const monthFiltered = filtered.filter(e => {
    const [day, mon, year] = e.date.split('/');
    return `${mon}-${year}` === month;
  });

  if (monthFiltered.length === 0) {
    alert("Nav datu izvēlētajam mēnesim.");
    return;
  }

  const odometers = monthFiltered.map(e => Number(e.odometer)).filter(n => !isNaN(n));
  const fuels = monthFiltered.map(e => Number(e.fuel)).filter(n => !isNaN(n));

  const totalKm = odometers.length > 1 ? Math.max(...odometers) - Math.min(...odometers) : 0;
  const totalFuel = fuels.reduce((sum, val) => sum + val, 0);
  const avgConsumption = totalKm > 0 ? ((totalFuel / totalKm) * 100).toFixed(2) : '0.00';

  const summaryRow = {
    date: "Kopā",
    odometer: `${totalKm} km`,
    fuel: `${totalFuel.toFixed(2)} L`,
    driver: `${avgConsumption} L/100km`,
    truck: ""
  };

  const exportData = [...monthFiltered, summaryRow];

  const columns = ["date", "odometer", "fuel", "driver"];
  const headers = ["Datums", "Odometrs", "Degviela", "Vadītājs"];

  const dataWithHeaders = [[`${truck} (${month})`], headers, ...exportData.map(entry => columns.map(col => entry[col] || ""))];

  const ws = XLSX.utils.aoa_to_sheet(dataWithHeaders);

  const boldStyle = {
    font: { bold: true },
    border: {
      top: { style: "medium", color: { rgb: "000000" } },
      bottom: { style: "medium", color: { rgb: "000000" } },
      left: { style: "medium", color: { rgb: "000000" } },
      right: { style: "medium", color: { rgb: "000000" } }
    }
  };

  const titleStyle = {
    font: { bold: true, sz: 14 },
  };

  const thinBorder = {
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } }
    }
  };

  const summaryRowIndex = dataWithHeaders.length - 1;

  for (let r = 0; r < dataWithHeaders.length; r++) {
    for (let c = 0; c < columns.length; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c });
      if (!ws[cellRef]) ws[cellRef] = {};
      if (r === 0) {
        ws[cellRef].s = titleStyle;
      } else if (r === 1 || r === summaryRowIndex) {
        ws[cellRef].s = boldStyle;
      } else {
        ws[cellRef].s = thinBorder;
      }
    }
  }

  ws['!cols'] = [
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `${truck} ${month}`);

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array", cellStyles: true });
  saveAs(new Blob([wbout], { type: "application/octet-stream" }), `${truck}-${month}.xlsx`);
}
