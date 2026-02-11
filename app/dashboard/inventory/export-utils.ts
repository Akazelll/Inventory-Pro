import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// Ekspor ke PDF
export const exportToPDF = (data: any[], start: string, end: string) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("LAPORAN TRANSAKSI INVENTARIS", 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Periode: ${start} s/d ${end}`, 14, 30);

  autoTable(doc, {
    startY: 40,
    head: [["Tanggal", "Produk", "SKU", "Tipe", "Qty", "Petugas"]],
    body: data.map((item) => [
      new Date(item.tanggal).toLocaleDateString("id-ID"),
      item.nama_produk,
      item.sku_produk,
      item.jenis_transaksi,
      item.jumlah,
      item.petugas,
    ]),
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 9 },
    margin: { top: 40 },
  });

  doc.save(`Laporan_Inventaris_${start}_to_${end}.pdf`);
};

// Ekspor ke Excel
export const exportToExcel = (data: any[], start: string, end: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");

  XLSX.writeFile(workbook, `Laporan_Inventaris_${start}_to_${end}.xlsx`);
};
