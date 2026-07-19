/**
 * JP College DMS Export Service
 * PDF, Excel, CSV, and Print generator for all modules
 */
class ExportService {
  // Generate CSV File from array of objects
  exportToCSV(filename, rows) {
    if (!rows || !rows.length) return alert('No data available to export!');
    
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => headers.map(header => {
        const val = row[header] === undefined || row[header] === null ? '' : row[header];
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Generate Excel File (.xlsx) using SheetJS
  exportToExcel(filename, rows, sheetName = 'Data') {
    if (!rows || !rows.length) return alert('No data available to export!');
    
    if (typeof XLSX === 'undefined') {
      return this.exportToCSV(filename, rows);
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }

  // Generate Professional PDF with JP College Header using jsPDF & autoTable
  exportToPDF(title, filename, columns, rows) {
    if (!rows || !rows.length) return alert('No data available to export!');

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Golden & Dark Header Banner
    doc.setFillColor(18, 18, 24);
    doc.rect(0, 0, 210, 32, 'F');

    doc.setTextColor(255, 215, 0); // Golden text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('J.P. COLLEGE OF ENGINEERING', 105, 12, { align: 'center' });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text('Department Management System - Official Report', 105, 18, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    doc.text(`Report: ${title} | Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 105, 25, { align: 'center' });

    // Table mapping
    const tableHeaders = columns.map(c => c.header);
    const tableBody = rows.map(row => columns.map(c => row[c.dataKey] !== undefined ? String(row[c.dataKey]) : ''));

    doc.autoTable({
      startY: 36,
      head: [tableHeaders],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [212, 175, 55], // Golden header
        textColor: [18, 18, 24],
        fontStyle: 'bold',
        fontSize: 10
      },
      styles: {
        fontSize: 8,
        cellPadding: 2.5
      },
      alternateRowStyles: {
        fillColor: [245, 245, 250]
      }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`Page ${i} of ${pageCount} - J.P. College of Engineering, Ayikudi, Tenkasi.`, 105, 288, { align: 'center' });
    }

    doc.save(`${filename}.pdf`);
  }

  // Trigger browser print for printable area
  printView(title, tableHtml) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print - ${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #111; }
          .header { text-align: center; border-bottom: 2px solid #FFD700; padding-bottom: 15px; margin-bottom: 20px; }
          .header h1 { margin: 0; color: #111; font-size: 20px; }
          .header p { margin: 5px 0 0 0; color: #666; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #ccc; padding: 8px 10px; text-align: left; font-size: 12px; }
          th { background: #FFD700; color: #000; font-weight: bold; }
          tr:nth-child(even) { background: #f9f9f9; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>J.P. COLLEGE OF ENGINEERING</h1>
          <p>Ayikudi, Tenkasi, Tamil Nadu - Department Management System</p>
          <h3>${title}</h3>
          <p>Generated: ${new Date().toLocaleString()}</p>
        </div>
        ${tableHtml}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }
}

const exporter = new ExportService();
