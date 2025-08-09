import { TableData, ExportOptions, ImportResult } from '../types/index';
import { MarkdownTableParser } from './markdown';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * 导入导出管理器
 */
export class ImportExportManager {
  /**
   * 导入文件
   */
  static async import(file: File): Promise<ImportResult> {
    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      switch (fileExtension) {
        case 'md':
        case 'markdown':
          return await this.importMarkdown(file);
        case 'csv':
          return await this.importCSV(file);
        case 'xlsx':
        case 'xls':
          return await this.importExcel(file);
        case 'json':
          return await this.importJSON(file);
        default:
          return {
            success: false,
            error: `Unsupported file format: ${fileExtension}`
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * 导出为 Markdown 字符串
   */
  static exportToMarkdown(tableData: TableData): string {
    return MarkdownTableParser.serialize(tableData);
  }

  /**
   * 导出表格数据
   */
  static async export(tableData: TableData, options: ExportOptions): Promise<void> {
    try {
      switch (options.format) {
        case 'markdown':
          await this.exportMarkdown(tableData, options);
          break;
        case 'html':
          await this.exportHTML(tableData, options);
          break;
        case 'csv':
          await this.exportCSV(tableData, options);
          break;
        case 'excel':
          await this.exportExcel(tableData, options);
          break;
        case 'png':
          await this.exportImage(tableData, options, 'png');
          break;
        case 'svg':
          await this.exportImage(tableData, options, 'svg');
          break;
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  /**
   * 导入 Markdown 文件
   */
  private static async importMarkdown(file: File): Promise<ImportResult> {
    const text = await file.text();
    
    try {
      const data = MarkdownTableParser.parse(text);
      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid Markdown table format'
      };
    }
  }

  /**
   * 导入 CSV 文件
   */
  private static async importCSV(file: File): Promise<ImportResult> {
    const text = await file.text();
    
    return new Promise((resolve) => {
      Papa.parse(text, {
        complete: (results) => {
          try {
            const data = results.data as string[][];
            
            if (data.length < 2) {
              resolve({
                success: false,
                error: 'CSV file must have at least 2 rows (header + data)'
              });
              return;
            }

            const headers = data[0];
            const rows = data.slice(1).filter(row => row.some(cell => cell.trim() !== ''));
            const alignments = Array(headers.length).fill('left') as ('left' | 'center' | 'right')[];

            resolve({
              success: true,
              data: {
                headers,
                rows,
                alignments
              }
            });
          } catch (error) {
            resolve({
              success: false,
              error: 'Failed to parse CSV file'
            });
          }
        },
        error: (error: any) => {
          resolve({
            success: false,
            error: `CSV parsing error: ${error.message}`
          });
        }
      });
    });
  }

  /**
   * 导入 Excel 文件
   */
  private static async importExcel(file: File): Promise<ImportResult> {
    const arrayBuffer = await file.arrayBuffer();
    
    try {
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
      
      if (data.length < 2) {
        return {
          success: false,
          error: 'Excel file must have at least 2 rows (header + data)'
        };
      }

      const headers = data[0];
      const rows = data.slice(1).filter(row => row.some(cell => cell && cell.toString().trim() !== ''));
      const alignments = Array(headers.length).fill('left') as ('left' | 'center' | 'right')[];

      return {
        success: true,
        data: {
          headers: headers.map(h => h?.toString() || ''),
          rows: rows.map(row => row.map(cell => cell?.toString() || '')),
          alignments
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to parse Excel file'
      };
    }
  }

  /**
   * 导入 JSON 文件
   */
  private static async importJSON(file: File): Promise<ImportResult> {
    const text = await file.text();
    
    try {
      const jsonData = JSON.parse(text);
      
      // 检查是否是表格数据格式
      if (jsonData.headers && jsonData.rows && Array.isArray(jsonData.headers) && Array.isArray(jsonData.rows)) {
        const alignments = jsonData.alignments || Array(jsonData.headers.length).fill('left');
        
        return {
          success: true,
          data: {
            headers: jsonData.headers,
            rows: jsonData.rows,
            alignments
          }
        };
      }
      
      // 尝试从对象数组转换
      if (Array.isArray(jsonData) && jsonData.length > 0) {
        const headers = Object.keys(jsonData[0]);
        const rows = jsonData.map(item => headers.map(header => item[header]?.toString() || ''));
        const alignments = Array(headers.length).fill('left') as ('left' | 'center' | 'right')[];
        
        return {
          success: true,
          data: {
            headers,
            rows,
            alignments
          }
        };
      }
      
      return {
        success: false,
        error: 'Invalid JSON format for table data'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to parse JSON file'
      };
    }
  }

  /**
   * 导出为 Markdown
   */
  private static async exportMarkdown(tableData: TableData, options: ExportOptions): Promise<void> {
    const markdown = MarkdownTableParser.serialize(tableData);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const filename = options.filename || 'table.md';
    saveAs(blob, filename);
  }

  /**
   * 导出为 HTML
   */
  private static async exportHTML(tableData: TableData, options: ExportOptions): Promise<void> {
    const { headers, rows, alignments } = tableData;
    
    let html = '<table border="1" cellpadding="8" cellspacing="0">\n';
    
    // 表头
    html += '  <thead>\n    <tr>\n';
    headers.forEach((header, index) => {
      const align = alignments[index] || 'left';
      html += `      <th style="text-align: ${align}">${header}</th>\n`;
    });
    html += '    </tr>\n  </thead>\n';
    
    // 表体
    html += '  <tbody>\n';
    rows.forEach(row => {
      html += '    <tr>\n';
      row.forEach((cell, index) => {
        const align = alignments[index] || 'left';
        html += `      <td style="text-align: ${align}">${cell}</td>\n`;
      });
      html += '    </tr>\n';
    });
    html += '  </tbody>\n</table>';
    
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Table Export</title>
  <style>
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; }
    th { background-color: #f2f2f2; }
  </style>
</head>
<body>
${html}
</body>
</html>`;
    
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const filename = options.filename || 'table.html';
    saveAs(blob, filename);
  }

  /**
   * 导出为 CSV
   */
  private static async exportCSV(tableData: TableData, options: ExportOptions): Promise<void> {
    const { headers, rows } = tableData;
    const csvData = [headers, ...rows];
    const csv = Papa.unparse(csvData);
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const filename = options.filename || 'table.csv';
    saveAs(blob, filename);
  }

  /**
   * 导出为 Excel
   */
  private static async exportExcel(tableData: TableData, options: ExportOptions): Promise<void> {
    const { headers, rows } = tableData;
    const worksheetData = [headers, ...rows];
    
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Table');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const filename = options.filename || 'table.xlsx';
    saveAs(blob, filename);
  }

  /**
   * 导出为图片
   */
  private static async exportImage(tableData: TableData, options: ExportOptions, format: 'png' | 'svg'): Promise<void> {
    // 创建临时表格元素
    const table = this.createTableElement(tableData);
    document.body.appendChild(table);
    
    try {
      if (format === 'png') {
        const canvas = await html2canvas(table, {
          backgroundColor: '#ffffff',
          scale: 2,
          ...options.imageOptions
        });
        
        canvas.toBlob((blob) => {
          if (blob) {
            const filename = options.filename || 'table.png';
            saveAs(blob, filename);
          }
        }, 'image/png');
      } else {
        // SVG 导出需要更复杂的实现
        const svgContent = this.createSVGFromTable(tableData);
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const filename = options.filename || 'table.svg';
        saveAs(blob, filename);
      }
    } finally {
      document.body.removeChild(table);
    }
  }

  /**
   * 创建表格 DOM 元素
   */
  private static createTableElement(tableData: TableData): HTMLTableElement {
    const { headers, rows, alignments } = tableData;
    
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.border = '1px solid #ddd';
    table.style.fontFamily = 'Arial, sans-serif';
    table.style.fontSize = '14px';
    
    // 创建表头
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    headers.forEach((header, index) => {
      const th = document.createElement('th');
      th.textContent = header;
      th.style.border = '1px solid #ddd';
      th.style.padding = '8px';
      th.style.backgroundColor = '#f2f2f2';
      th.style.textAlign = alignments[index] || 'left';
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // 创建表体
    const tbody = document.createElement('tbody');
    
    rows.forEach(row => {
      const tr = document.createElement('tr');
      
      row.forEach((cell, index) => {
        const td = document.createElement('td');
        td.textContent = cell;
        td.style.border = '1px solid #ddd';
        td.style.padding = '8px';
        td.style.textAlign = alignments[index] || 'left';
        tr.appendChild(td);
      });
      
      tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    
    // 设置表格位置为屏幕外
    table.style.position = 'absolute';
    table.style.left = '-9999px';
    table.style.top = '-9999px';
    
    return table;
  }

  /**
   * 创建 SVG 表格
   */
  private static createSVGFromTable(tableData: TableData): string {
    const { headers, rows, alignments } = tableData;
    const cellWidth = 120;
    const cellHeight = 30;
    const totalWidth = headers.length * cellWidth;
    const totalHeight = (rows.length + 1) * cellHeight;
    
    let svg = `<svg width="${totalWidth}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">`;
    
    // 表头
    headers.forEach((header, colIndex) => {
      const x = colIndex * cellWidth;
      const y = 0;
      
      svg += `<rect x="${x}" y="${y}" width="${cellWidth}" height="${cellHeight}" fill="#f2f2f2" stroke="#ddd" stroke-width="1"/>`;
      svg += `<text x="${x + cellWidth / 2}" y="${y + cellHeight / 2 + 5}" text-anchor="middle" font-family="Arial" font-size="14" font-weight="bold">${header}</text>`;
    });
    
    // 数据行
    rows.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const x = colIndex * cellWidth;
        const y = (rowIndex + 1) * cellHeight;
        
        svg += `<rect x="${x}" y="${y}" width="${cellWidth}" height="${cellHeight}" fill="white" stroke="#ddd" stroke-width="1"/>`;
        svg += `<text x="${x + cellWidth / 2}" y="${y + cellHeight / 2 + 5}" text-anchor="middle" font-family="Arial" font-size="12">${cell}</text>`;
      });
    });
    
    svg += '</svg>';
    
    return svg;
  }

  /**
   * 导出为 SVG 字符串
   */
  static async exportToSVG(tableData: TableData, cellStyles?: any): Promise<string> {
    return this.createSVGFromTable(tableData);
  }

  /**
   * 导出为 PNG Canvas
   */
  static async exportToPNG(tableData: TableData, cellStyles?: any): Promise<HTMLCanvasElement> {
    const tableElement = this.createTableElement(tableData);
    
    // 临时添加到 DOM 中进行渲染
    tableElement.style.position = 'absolute';
    tableElement.style.left = '-9999px';
    document.body.appendChild(tableElement);
    
    try {
      const canvas = await html2canvas(tableElement);
      return canvas;
    } finally {
      document.body.removeChild(tableElement);
    }
  }

  /**
   * 导出为 HTML 字符串
   */
  static exportToHTML(tableData: TableData, cellStyles?: any): string {
    const { headers, rows, alignments } = tableData;
    
    let html = '<table border="1" cellpadding="8" cellspacing="0">\n';
    
    // 表头
    html += '  <thead>\n    <tr>\n';
    headers.forEach((header, index) => {
      const align = alignments[index] || 'left';
      html += `      <th style="text-align: ${align}">${header}</th>\n`;
    });
    html += '    </tr>\n  </thead>\n';
    
    // 表体
    html += '  <tbody>\n';
    rows.forEach(row => {
      html += '    <tr>\n';
      row.forEach((cell, index) => {
        const align = alignments[index] || 'left';
        html += `      <td style="text-align: ${align}">${cell}</td>\n`;
      });
      html += '    </tr>\n';
    });
    html += '  </tbody>\n</table>';
    
    return html;
  }

  /**
   * 从剪贴板导入数据
   */
  static async importFromClipboard(): Promise<ImportResult> {
    try {
      const text = await navigator.clipboard.readText();
      
      // 尝试解析为 Markdown 表格
      if (MarkdownTableParser.validate(text)) {
        const data = MarkdownTableParser.parse(text);
        return {
          success: true,
          data
        };
      }
      
      // 尝试解析为 TSV (Tab-separated values)
      const lines = text.trim().split('\n');
      if (lines.length >= 2) {
        const headers = lines[0].split('\t');
        const rows = lines.slice(1).map(line => line.split('\t'));
        const alignments = Array(headers.length).fill('left') as ('left' | 'center' | 'right')[];
        
        return {
          success: true,
          data: {
            headers,
            rows,
            alignments
          }
        };
      }
      
      return {
        success: false,
        error: 'Clipboard content is not a valid table format'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to read from clipboard'
      };
    }
  }

  /**
   * 复制表格到剪贴板
   */
  static async exportToClipboard(tableData: TableData, format: 'markdown' | 'tsv' = 'markdown'): Promise<boolean> {
    try {
      let content: string;
      
      if (format === 'markdown') {
        content = MarkdownTableParser.serialize(tableData);
      } else {
        // TSV format
        const { headers, rows } = tableData;
        const tsvData = [headers, ...rows];
        content = tsvData.map(row => row.join('\t')).join('\n');
      }
      
      await navigator.clipboard.writeText(content);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }
}