import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

(pdfMake as any).vfs = pdfFonts;

export interface ReporteData {
  stats: {
    bolsaTotal: number;
    erogadoTotal: number;
    pendienteTotal: number;
    perdidoInactivos: number;
    totalBecados: number;
    totalUniversidades: number;
    totalModalidades: number;
    becadosActivos: number;
    becadosInactivos: number;
    porcentajeErogado: number;
  };
  anio: number;
  fechaGeneracion: Date;
  becados?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ReporteService {

  constructor() { }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(value);
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'full',
      timeStyle: 'medium'
    }).format(date);
  }

  // ==================== EXCEL ====================
  async exportToExcel(data: ReporteData): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema de Becas';
    workbook.created = new Date();
    workbook.properties.date1904 = true;

    // Hoja principal: Dashboard
    const dashboardSheet = workbook.addWorksheet('Dashboard', {
      pageSetup: { orientation: 'portrait', fitToPage: true }
    });

    // Configurar anchos de columnas
    dashboardSheet.columns = [
      { width: 20 },
      { width: 25 },
      { width: 25 },
      { width: 25 }
    ];

    let currentRow = 1;

    // ===== TÍTULO =====
    dashboardSheet.mergeCells(`A${currentRow}:D${currentRow}`);
    const titleCell = dashboardSheet.getCell(`A${currentRow}`);
    titleCell.value = 'SISTEMA DE BECAS - REPORTE FINANCIERO';
    titleCell.font = { name: 'Calibri', size: 20, bold: true, color: { argb: 'FF1F3D66' } };
    titleCell.alignment = { horizontal: 'left', vertical: 'middle' };
    currentRow++;

    // ===== FECHA Y AÑO =====
    dashboardSheet.mergeCells(`A${currentRow}:D${currentRow}`);
    const dateCell = dashboardSheet.getCell(`A${currentRow}`);
    dateCell.value = `Generado: ${this.formatDate(data.fechaGeneracion)}`;
    dateCell.font = { italic: true, size: 10 };
    dateCell.alignment = { horizontal: 'left' };
    currentRow++;

    dashboardSheet.mergeCells(`A${currentRow}:D${currentRow}`);
    const anioCell = dashboardSheet.getCell(`A${currentRow}`);
    anioCell.value = `Año filtrado: ${data.anio}`;
    anioCell.font = { bold: true, size: 11, color: { argb: 'FF1F3D66' } };
    currentRow += 2;

    // ===== SECCIÓN: RESUMEN FINANCIERO =====
    dashboardSheet.mergeCells(`A${currentRow}:D${currentRow}`);
    const finHeaderCell = dashboardSheet.getCell(`A${currentRow}`);
    finHeaderCell.value = '📊 RESUMEN FINANCIERO';
    finHeaderCell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FF1F3D66' } };
    finHeaderCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F4F8' } };
    currentRow++;

    // Tabla de resumen financiero
    const finData = [
      ['Bolsa Total', '', this.formatCurrency(data.stats.bolsaTotal), ''],
      ['Dinero Erogado', '', this.formatCurrency(data.stats.erogadoTotal), ''],
      ['Faltante Total', '', this.formatCurrency(data.stats.pendienteTotal), ''],
      ['Perdido (Inactivos)', '', this.formatCurrency(data.stats.perdidoInactivos), ''],
      ['Progreso de Erogado', '', `${data.stats.porcentajeErogado.toFixed(2)}%`, '']
    ];

    const borderStyle: Partial<ExcelJS.Borders> = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    finData.forEach((row, idx) => {
      const rowNum = currentRow + idx;
      const labelCell = dashboardSheet.getCell(`A${rowNum}`);
      labelCell.value = row[0];
      labelCell.font = { name: 'Calibri', size: 11, bold: true };
      labelCell.border = borderStyle;

      const valueCell = dashboardSheet.getCell(`C${rowNum}`);
      valueCell.value = row[2];
      if (idx === 3) {
        valueCell.font = { name: 'Calibri', size: 11, color: { argb: 'FFDC2626' } };
      } else if (idx === 2) {
        valueCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFD97706' } };
      } else {
        valueCell.font = { name: 'Calibri', size: 11 };
      }
      valueCell.numFmt = '"$"#,##0.00';
      valueCell.border = borderStyle;
      valueCell.alignment = { horizontal: 'right', vertical: 'middle' };

      const emptyCell1 = dashboardSheet.getCell(`B${rowNum}`);
      emptyCell1.border = borderStyle;
      const emptyCell2 = dashboardSheet.getCell(`D${rowNum}`);
      emptyCell2.border = borderStyle;
    });
    currentRow += finData.length + 1;

    // ===== SECCIÓN: RESUMEN DE BECADOS =====
    dashboardSheet.mergeCells(`A${currentRow}:D${currentRow}`);
    const becadosHeaderCell = dashboardSheet.getCell(`A${currentRow}`);
    becadosHeaderCell.value = '👥 RESUMEN DE BECADOS';
    becadosHeaderCell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FF1F3D66' } };
    becadosHeaderCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F4F8' } };
    currentRow++;

    const becadosData = [
      ['Total Becados', data.stats.totalBecados, 'Activos', data.stats.becadosActivos],
      ['Universidades', data.stats.totalUniversidades, 'Inactivos', data.stats.becadosInactivos],
      ['Modalidades', data.stats.totalModalidades, '', '']
    ];

    becadosData.forEach((row, idx) => {
      const rowNum = currentRow + idx;
      
      const label1Cell = dashboardSheet.getCell(`A${rowNum}`);
      label1Cell.value = row[0];
      label1Cell.font = { name: 'Calibri', size: 11, bold: true };
      label1Cell.border = borderStyle;
      
      const value1Cell = dashboardSheet.getCell(`B${rowNum}`);
      value1Cell.value = row[1];
      value1Cell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF1F3D66' } };
      value1Cell.alignment = { horizontal: 'center' };
      value1Cell.border = borderStyle;
      
      const label2Cell = dashboardSheet.getCell(`C${rowNum}`);
      label2Cell.value = row[2];
      label2Cell.font = { name: 'Calibri', size: 11, bold: true };
      label2Cell.border = borderStyle;
      
      const value2Cell = dashboardSheet.getCell(`D${rowNum}`);
      value2Cell.value = row[3];
      if (row[2] === 'Activos') {
        value2Cell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF059669' } };
      } else if (row[2] === 'Inactivos') {
        value2Cell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFDC2626' } };
      } else {
        value2Cell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF1F3D66' } };
      }
      value2Cell.alignment = { horizontal: 'center' };
      value2Cell.border = borderStyle;
    });

    currentRow += becadosData.length + 2;

    // ===== PIE DE PÁGINA =====
    dashboardSheet.mergeCells(`A${currentRow}:D${currentRow}`);
    const footerCell = dashboardSheet.getCell(`A${currentRow}`);
    footerCell.value = 'Reporte generado automáticamente por el Sistema de Becas';
    footerCell.font = { italic: true, size: 9, color: { argb: 'FF94A3B8' } };
    footerCell.alignment = { horizontal: 'center' };

    // Generar y descargar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Reporte_Dashboard_${data.anio}_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  // ==================== PDF ====================
  async exportToPDF(data: ReporteData): Promise<void> {
    const docDefinition: any = {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [40, 60, 40, 60],
      
      header: (currentPage: number, pageCount: number) => {
        if (currentPage === 1) {
          return {
            columns: [
              {
                text: 'SISTEMA DE BECAS',
                alignment: 'center',
                fontSize: 10,
                color: '#64748b',
                margin: [0, 20, 0, 0]
              }
            ]
          };
        }
        return {
          columns: [
            {
              text: `Sistema de Becas - Reporte Financiero (Pág. ${currentPage}/${pageCount})`,
              alignment: 'center',
              fontSize: 8,
              color: '#94a3b8'
            }
          ]
        };
      },
      
      footer: (currentPage: number, pageCount: number) => {
        return {
          columns: [
            {
              text: `Generado: ${this.formatDate(data.fechaGeneracion)}`,
              alignment: 'left',
              fontSize: 8,
              color: '#94a3b8'
            },
            {
              text: `Página ${currentPage} de ${pageCount}`,
              alignment: 'right',
              fontSize: 8,
              color: '#94a3b8'
            }
          ],
          margin: [40, 0, 40, 20]
        };
      },
      
      content: [
        {
          text: 'REPORTE FINANCIERO',
          style: 'mainTitle',
          alignment: 'center',
          margin: [0, 0, 0, 10]
        },
        {
          text: `Año filtrado: ${data.anio}`,
          style: 'subtitle',
          alignment: 'center',
          margin: [0, 0, 0, 30]
        },
        
        {
          text: 'Resumen Financiero',
          style: 'sectionTitle',
          margin: [0, 10, 0, 10]
        },
        {
          layout: 'lightHorizontalLines',
          table: {
            headerRows: 1,
            widths: ['*', 'auto', '*', 'auto'],
            body: [
              [
                { text: 'Concepto', style: 'tableHeader', alignment: 'center' },
                { text: 'Monto', style: 'tableHeader', alignment: 'center' },
                { text: 'Concepto', style: 'tableHeader', alignment: 'center' },
                { text: 'Monto', style: 'tableHeader', alignment: 'center' }
              ],
              [
                'Bolsa Total',
                { text: this.formatCurrency(data.stats.bolsaTotal), alignment: 'right', color: '#1f3d66', bold: true },
                'Dinero Erogado',
                { text: this.formatCurrency(data.stats.erogadoTotal), alignment: 'right', color: '#059669', bold: true }
              ],
              [
                'Faltante Total',
                { text: this.formatCurrency(data.stats.pendienteTotal), alignment: 'right', color: '#d97706', bold: true },
                'Perdido (Inactivos)',
                { text: this.formatCurrency(data.stats.perdidoInactivos), alignment: 'right', color: '#dc2626', bold: true }
              ],
              [
                'Progreso de Erogado',
                { text: `${data.stats.porcentajeErogado.toFixed(2)}%`, alignment: 'right', color: '#059669', bold: true },
                '',
                ''
              ]
            ]
          }
        },
        
        {
          margin: [0, 15, 0, 20],
          stack: [
            { text: 'Progreso de Erogación', style: 'label', margin: [0, 0, 0, 5] },
            {
              canvas: [
                {
                  type: 'rect',
                  x: 0,
                  y: 0,
                  w: 515,
                  h: 20,
                  color: '#e2e8f0'
                },
                {
                  type: 'rect',
                  x: 0,
                  y: 0,
                  w: (515 * data.stats.porcentajeErogado) / 100,
                  h: 20,
                  color: '#059669'
                },
                {
                  type: 'text',
                  x: 515 / 2,
                  y: 15,
                  text: `${data.stats.porcentajeErogado.toFixed(1)}%`,
                  color: 'white',
                  fontSize: 10,
                  bold: true
                }
              ]
            }
          ]
        },
        
        {
          text: 'Resumen de Becados',
          style: 'sectionTitle',
          margin: [0, 20, 0, 10]
        },
        {
          layout: 'lightHorizontalLines',
          table: {
            widths: ['*', '*', '*', '*'],
            body: [
              [
                { text: 'Total Becados', style: 'tableHeader', alignment: 'center' },
                { text: 'Universidades', style: 'tableHeader', alignment: 'center' },
                { text: 'Modalidades', style: 'tableHeader', alignment: 'center' },
                { text: 'Activos / Inactivos', style: 'tableHeader', alignment: 'center' }
              ],
              [
                { text: data.stats.totalBecados.toString(), style: 'bigNumber', alignment: 'center' },
                { text: data.stats.totalUniversidades.toString(), style: 'bigNumber', alignment: 'center' },
                { text: data.stats.totalModalidades.toString(), style: 'bigNumber', alignment: 'center' },
                {
                  stack: [
                    { text: `Activos: ${data.stats.becadosActivos}`, color: '#166534' },
                    { text: `Inactivos: ${data.stats.becadosInactivos}`, color: '#991b1b' }
                  ],
                  alignment: 'center'
                }
              ]
            ]
          }
        },
        
        {
          text: 'Nota: Los montos están expresados en pesos mexicanos (MXN).',
          style: 'note',
          margin: [0, 30, 0, 10]
        },
        {
          text: 'Reporte generado automáticamente por el Sistema de Becas',
          style: 'footer',
          alignment: 'center',
          margin: [0, 20, 0, 0]
        }
      ],
      
      styles: {
        mainTitle: {
          fontSize: 24,
          bold: true,
          color: '#1f3d66'
        },
        subtitle: {
          fontSize: 14,
          color: '#64748b'
        },
        sectionTitle: {
          fontSize: 16,
          bold: true,
          color: '#1f3d66',
          decoration: 'underline'
        },
        tableHeader: {
          bold: true,
          fontSize: 11,
          fillColor: '#1f3d66',
          color: 'white',
          margin: [5, 5, 5, 5]
        },
        bigNumber: {
          fontSize: 20,
          bold: true,
          color: '#1f3d66'
        },
        label: {
          fontSize: 10,
          bold: true,
          color: '#475569'
        },
        note: {
          fontSize: 9,
          italics: true,
          color: '#94a3b8'
        },
        footer: {
          fontSize: 8,
          italics: true,
          color: '#cbd5e1'
        }
      },
      
      defaultStyle: {
        font: 'Roboto',
        fontSize: 10
      }
    };

    pdfMake.createPdf(docDefinition).open();
  }
}