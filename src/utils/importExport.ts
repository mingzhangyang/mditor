import { TableData, ExportOptions, ImportResult } from '../types/index';
import { MarkdownTableParser } from './markdown';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';

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
  static async export(tableData: TableData, options: ExportOptions, cellStyles?: Map<string, any>, appSettings?: any): Promise<void> {
    try {
      switch (options.format) {
        case 'markdown':
          await this.exportMarkdown(tableData, options);
          break;
        case 'html':
          await this.exportHTML(tableData, options, cellStyles, appSettings);
          break;
        case 'csv':
          await this.exportCSV(tableData, options);
          break;
        case 'excel':
          await this.exportExcel(tableData, options, cellStyles, appSettings);
          break;
        case 'png':
          await this.exportImage(tableData, options, 'png', cellStyles, appSettings);
          break;
        case 'svg':
          await this.exportImage(tableData, options, 'svg', cellStyles, appSettings);
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
  private static async exportHTML(tableData: TableData, options: ExportOptions, cellStyles?: Map<string, any>, appSettings?: any): Promise<void> {
    const { headers, rows, alignments, columnWidths } = tableData;
    
    // 获取当前主题的CSS变量值
    const computedStyle = getComputedStyle(document.documentElement);
    const bgColor = computedStyle.getPropertyValue('--bg-color').trim() || '#ffffff';
    const textColor = computedStyle.getPropertyValue('--text-color').trim() || '#000000';
    const borderColor = computedStyle.getPropertyValue('--border-color').trim() || '#e8e8e8';
    const surfaceColor = computedStyle.getPropertyValue('--surface-color').trim() || '#fafafa';
    
    let html = '<table style="border-collapse: collapse; width: 100%; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, \'Helvetica Neue\', Arial, sans-serif;">\n';
    
    // 表头
    html += '  <thead>\n    <tr>\n';
    headers.forEach((header, index) => {
      const cellKey = `${-1}-${index}`;
      const customStyle = cellStyles?.get(cellKey) || {};
      const columnWidth = columnWidths?.[index] || 150;
      
      const styles = [
        `width: ${columnWidth}px`,
        `min-width: ${columnWidth}px`,
        `max-width: ${columnWidth}px`,
        `border: ${customStyle.borderWidth || 1}px ${customStyle.borderStyle || 'solid'} ${customStyle.borderColor || borderColor}`,
        `padding: ${customStyle.padding || 8}px`,
        `background-color: ${customStyle.backgroundColor || surfaceColor}`,
        `color: ${customStyle.color || textColor}`,
        `text-align: ${customStyle.textAlign || alignments[index] || 'left'}`,
        `font-weight: ${customStyle.fontWeight || 'bold'}`,
        `font-size: ${customStyle.fontSize ? customStyle.fontSize + 'px' : (appSettings?.fontSize || 14) + 'px'}`,
        `font-style: ${customStyle.fontStyle || 'normal'}`,
        `text-decoration: ${customStyle.textDecoration || 'none'}`
      ];
      
      html += `      <th style="${styles.join('; ')}">${header}</th>\n`;
    });
    html += '    </tr>\n  </thead>\n';
    
    // 表体
    html += '  <tbody>\n';
    rows.forEach((row, rowIndex) => {
      const rowBg = appSettings?.alternateRowColors && rowIndex % 2 === 1 ? surfaceColor : bgColor;
      html += '    <tr>\n';
      row.forEach((cell, colIndex) => {
        const cellKey = `${rowIndex}-${colIndex}`;
        const customStyle = cellStyles?.get(cellKey) || {};
        const columnWidth = columnWidths?.[colIndex] || 150;
        
        const styles = [
          `width: ${columnWidth}px`,
          `min-width: ${columnWidth}px`,
          `max-width: ${columnWidth}px`,
          `border: ${customStyle.borderWidth || 1}px ${customStyle.borderStyle || 'solid'} ${customStyle.borderColor || borderColor}`,
          `padding: ${customStyle.padding || 8}px`,
          `background-color: ${customStyle.backgroundColor || rowBg}`,
          `color: ${customStyle.color || textColor}`,
          `text-align: ${customStyle.textAlign || alignments[colIndex] || 'left'}`,
          `font-weight: ${customStyle.fontWeight || 'normal'}`,
          `font-size: ${customStyle.fontSize ? customStyle.fontSize + 'px' : (appSettings?.fontSize || 14) + 'px'}`,
          `font-style: ${customStyle.fontStyle || 'normal'}`,
          `text-decoration: ${customStyle.textDecoration || 'none'}`,
          `word-break: break-word`,
          `white-space: ${appSettings?.wordWrap ? 'pre-wrap' : 'nowrap'}`
        ];
        
        html += `      <td style="${styles.join('; ')}">${cell}</td>\n`;
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
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: ${bgColor};
      color: ${textColor};
      margin: 20px;
    }
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
  private static async exportExcel(tableData: TableData, options: ExportOptions, cellStyles?: Map<string, any>, appSettings?: any): Promise<void> {
    const { headers, rows, columnWidths } = tableData;
    const worksheetData = [headers, ...rows];
    
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // 设置列宽（基于实际列宽或默认值）
    const colWidths = headers.map((_, index) => {
      const width = columnWidths?.[index] || 150;
      return { wch: Math.max(10, Math.min(50, width / 8)) }; // 转换像素到Excel字符宽度
    });
    worksheet['!cols'] = colWidths;
    
    // 应用样式（如果支持）
    if (cellStyles && appSettings) {
      // 为表头设置样式
      headers.forEach((_, colIndex) => {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIndex });
        const cellKey = `${-1}-${colIndex}`;
        const customStyle = cellStyles.get(cellKey) || {};
        
        if (!worksheet[cellRef]) worksheet[cellRef] = { v: headers[colIndex] };
        
        // Excel样式对象（简化版）
        worksheet[cellRef].s = {
          font: {
            bold: true,
            sz: customStyle.fontSize || appSettings.fontSize || 14
          },
          alignment: {
            horizontal: customStyle.textAlign || 'left'
          },
          border: {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          }
        };
      });
      
      // 为数据行设置样式
      rows.forEach((row, rowIndex) => {
        row.forEach((_, colIndex) => {
          const cellRef = XLSX.utils.encode_cell({ r: rowIndex + 1, c: colIndex });
          const cellKey = `${rowIndex}-${colIndex}`;
          const customStyle = cellStyles.get(cellKey) || {};
          
          if (!worksheet[cellRef]) worksheet[cellRef] = { v: rows[rowIndex][colIndex] };
          
          worksheet[cellRef].s = {
            font: {
              sz: customStyle.fontSize || appSettings.fontSize || 14,
              bold: customStyle.fontWeight === 'bold'
            },
            alignment: {
              horizontal: customStyle.textAlign || 'left'
            },
            border: {
              top: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
              right: { style: 'thin' }
            }
          };
        });
      });
    }
    
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
  private static async exportImage(tableData: TableData, options: ExportOptions, format: 'png' | 'svg', cellStyles?: Map<string, any>, appSettings?: any): Promise<void> {
    // 创建临时表格元素
    const table = this.createTableElement(tableData, cellStyles, appSettings);
    document.body.appendChild(table);
    
    try {
      if (format === 'png') {
        // 获取当前主题背景色
        const computedStyle = getComputedStyle(document.documentElement);
        const bgColor = computedStyle.getPropertyValue('--bg-color').trim() || '#ffffff';
        
        const canvas = await html2canvas(table, {
          backgroundColor: bgColor,
          scale: 2,
          useCORS: true,
          allowTaint: true,
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
        const svgContent = this.createSVGFromTable(tableData, cellStyles, appSettings);
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
  private static createTableElement(tableData: TableData, cellStyles?: Map<string, any>, appSettings?: any): HTMLTableElement {
    const { headers, rows, alignments, columnWidths } = tableData;
    
    // 获取当前主题的CSS变量值
    const computedStyle = getComputedStyle(document.documentElement);
    const bgColor = computedStyle.getPropertyValue('--bg-color').trim() || '#ffffff';
    const textColor = computedStyle.getPropertyValue('--text-color').trim() || '#000000';
    const borderColor = computedStyle.getPropertyValue('--border-color').trim() || '#e8e8e8';
    const surfaceColor = computedStyle.getPropertyValue('--surface-color').trim() || '#fafafa';
    
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.backgroundColor = bgColor;
    table.style.color = textColor;
    table.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    table.style.fontSize = `${appSettings?.fontSize || 14}px`;
    table.style.width = '100%';
    
    // 创建表头
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    headers.forEach((header, index) => {
      const th = document.createElement('th');
      th.textContent = header;
      
      // 应用列宽
      const columnWidth = columnWidths?.[index] || 150;
      th.style.width = `${columnWidth}px`;
      th.style.minWidth = `${columnWidth}px`;
      th.style.maxWidth = `${columnWidth}px`;
      
      // 获取单元格样式
      const cellKey = `${-1}-${index}`;
      const customStyle = cellStyles?.get(cellKey) || {};
      
      // 应用基础样式
      th.style.border = `1px solid ${borderColor}`;
      th.style.padding = `${customStyle.padding || 8}px`;
      th.style.backgroundColor = customStyle.backgroundColor || surfaceColor;
      th.style.color = customStyle.color || textColor;
      th.style.textAlign = customStyle.textAlign || alignments[index] || 'left';
      th.style.fontWeight = customStyle.fontWeight || 'bold';
      th.style.fontSize = customStyle.fontSize ? `${customStyle.fontSize}px` : 'inherit';
      th.style.fontStyle = customStyle.fontStyle || 'normal';
      th.style.textDecoration = customStyle.textDecoration || 'none';
      
      if (customStyle.borderColor) th.style.borderColor = customStyle.borderColor;
      if (customStyle.borderWidth) th.style.borderWidth = `${customStyle.borderWidth}px`;
      if (customStyle.borderStyle) th.style.borderStyle = customStyle.borderStyle;
      
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // 创建表体
    const tbody = document.createElement('tbody');
    
    rows.forEach((row, rowIndex) => {
      const tr = document.createElement('tr');
      
      // 应用斑马纹效果
      if (appSettings?.alternateRowColors && rowIndex % 2 === 1) {
        tr.style.backgroundColor = surfaceColor;
      }
      
      row.forEach((cell, colIndex) => {
        const td = document.createElement('td');
        td.textContent = cell;
        
        // 应用列宽
        const columnWidth = columnWidths?.[colIndex] || 150;
        td.style.width = `${columnWidth}px`;
        td.style.minWidth = `${columnWidth}px`;
        td.style.maxWidth = `${columnWidth}px`;
        
        // 获取单元格样式
        const cellKey = `${rowIndex}-${colIndex}`;
        const customStyle = cellStyles?.get(cellKey) || {};
        
        // 应用基础样式
        td.style.border = `1px solid ${borderColor}`;
        td.style.padding = `${customStyle.padding || 8}px`;
        td.style.backgroundColor = customStyle.backgroundColor || (appSettings?.alternateRowColors && rowIndex % 2 === 1 ? surfaceColor : bgColor);
        td.style.color = customStyle.color || textColor;
        td.style.textAlign = customStyle.textAlign || alignments[colIndex] || 'left';
        td.style.fontWeight = customStyle.fontWeight || 'normal';
        td.style.fontSize = customStyle.fontSize ? `${customStyle.fontSize}px` : 'inherit';
        td.style.fontStyle = customStyle.fontStyle || 'normal';
        td.style.textDecoration = customStyle.textDecoration || 'none';
        td.style.wordBreak = 'break-word';
        td.style.whiteSpace = appSettings?.wordWrap ? 'pre-wrap' : 'nowrap';
        
        if (customStyle.borderColor) td.style.borderColor = customStyle.borderColor;
        if (customStyle.borderWidth) td.style.borderWidth = `${customStyle.borderWidth}px`;
        if (customStyle.borderStyle) td.style.borderStyle = customStyle.borderStyle;
        
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
  private static createSVGFromTable(tableData: TableData, cellStyles?: Map<string, any>, appSettings?: any): string {
    const { headers, rows, alignments, columnWidths } = tableData;
    
    // 获取当前主题的CSS变量值
    const computedStyle = getComputedStyle(document.documentElement);
    const bgColor = computedStyle.getPropertyValue('--bg-color').trim() || '#ffffff';
    const textColor = computedStyle.getPropertyValue('--text-color').trim() || '#000000';
    const borderColor = computedStyle.getPropertyValue('--border-color').trim() || '#e8e8e8';
    const surfaceColor = computedStyle.getPropertyValue('--surface-color').trim() || '#fafafa';
    
    // 计算总宽度和高度
    const totalWidth = columnWidths ? columnWidths.reduce((sum, width) => sum + width, 0) : headers.length * 150;
    const cellHeight = 40;
    const totalHeight = (rows.length + 1) * cellHeight;
    
    let svg = `<svg width="${totalWidth}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">`;
    
    // 表头
    let currentX = 0;
    headers.forEach((header, colIndex) => {
      const cellKey = `${-1}-${colIndex}`;
      const customStyle = cellStyles?.get(cellKey) || {};
      const cellWidth = columnWidths?.[colIndex] || 150;
      
      const headerBg = customStyle.backgroundColor || surfaceColor;
      const headerColor = customStyle.color || textColor;
      const fontSize = customStyle.fontSize || appSettings?.fontSize || 14;
      const fontWeight = customStyle.fontWeight || 'bold';
      const textAlign = customStyle.textAlign || alignments[colIndex] || 'left';
      
      // 计算文本锚点
      let textAnchor = 'middle';
      let textX = currentX + cellWidth / 2;
      if (textAlign === 'left') {
        textAnchor = 'start';
        textX = currentX + 8;
      } else if (textAlign === 'right') {
        textAnchor = 'end';
        textX = currentX + cellWidth - 8;
      }
      
      svg += `<rect x="${currentX}" y="0" width="${cellWidth}" height="${cellHeight}" fill="${headerBg}" stroke="${customStyle.borderColor || borderColor}" stroke-width="${customStyle.borderWidth || 1}"/>`;
      svg += `<text x="${textX}" y="${cellHeight / 2 + 5}" text-anchor="${textAnchor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="${fontSize}" font-weight="${fontWeight}" fill="${headerColor}">${header}</text>`;
      
      currentX += cellWidth;
    });
    
    // 数据行
    rows.forEach((row, rowIndex) => {
      let currentX = 0;
      const rowBg = appSettings?.alternateRowColors && rowIndex % 2 === 1 ? surfaceColor : bgColor;
      
      row.forEach((cell, colIndex) => {
        const cellKey = `${rowIndex}-${colIndex}`;
        const customStyle = cellStyles?.get(cellKey) || {};
        const cellWidth = columnWidths?.[colIndex] || 150;
        const y = (rowIndex + 1) * cellHeight;
        
        const cellBg = customStyle.backgroundColor || rowBg;
        const cellColor = customStyle.color || textColor;
        const fontSize = customStyle.fontSize || appSettings?.fontSize || 14;
        const fontWeight = customStyle.fontWeight || 'normal';
        const textAlign = customStyle.textAlign || alignments[colIndex] || 'left';
        
        // 计算文本锚点
        let textAnchor = 'middle';
        let textX = currentX + cellWidth / 2;
        if (textAlign === 'left') {
          textAnchor = 'start';
          textX = currentX + 8;
        } else if (textAlign === 'right') {
          textAnchor = 'end';
          textX = currentX + cellWidth - 8;
        }
        
        svg += `<rect x="${currentX}" y="${y}" width="${cellWidth}" height="${cellHeight}" fill="${cellBg}" stroke="${customStyle.borderColor || borderColor}" stroke-width="${customStyle.borderWidth || 1}"/>`;
        svg += `<text x="${textX}" y="${y + cellHeight / 2 + 5}" text-anchor="${textAnchor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="${fontSize}" font-weight="${fontWeight}" fill="${cellColor}">${cell}</text>`;
        
        currentX += cellWidth;
      });
    });
    
    svg += '</svg>';
    
    return svg;
  }

  /**
   * 导出为 SVG 字符串
   */
  static async exportToSVG(tableData: TableData, cellStyles?: Map<string, any>, appSettings?: any): Promise<string> {
    return this.createSVGFromTable(tableData, cellStyles, appSettings);
  }

  /**
   * 导出为 PNG Canvas
   */
  static async exportToPNG(tableData: TableData, cellStyles?: Map<string, any>, appSettings?: any): Promise<HTMLCanvasElement> {
    const tableElement = this.createTableElement(tableData, cellStyles, appSettings);
    
    // 临时添加到 DOM 中进行渲染
    tableElement.style.position = 'absolute';
    tableElement.style.left = '-9999px';
    document.body.appendChild(tableElement);
    
    try {
      // 获取当前主题背景色
      const computedStyle = getComputedStyle(document.documentElement);
      const bgColor = computedStyle.getPropertyValue('--bg-color').trim() || '#ffffff';
      
      const canvas = await html2canvas(tableElement, {
        backgroundColor: bgColor,
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      return canvas;
    } finally {
      document.body.removeChild(tableElement);
    }
  }

  /**
   * 导出为 HTML 字符串
   */
  static exportToHTML(tableData: TableData, cellStyles?: Map<string, any>, appSettings?: any): string {
    const { headers, rows, alignments, columnWidths } = tableData;
    
    // 获取当前主题的CSS变量值
    const computedStyle = getComputedStyle(document.documentElement);
    const bgColor = computedStyle.getPropertyValue('--bg-color').trim() || '#ffffff';
    const textColor = computedStyle.getPropertyValue('--text-color').trim() || '#000000';
    const borderColor = computedStyle.getPropertyValue('--border-color').trim() || '#e8e8e8';
    const surfaceColor = computedStyle.getPropertyValue('--surface-color').trim() || '#fafafa';
    
    let html = '<table style="border-collapse: collapse; width: 100%; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, \'Helvetica Neue\', Arial, sans-serif;">\n';
    
    // 表头
    html += '  <thead>\n    <tr>\n';
    headers.forEach((header, index) => {
      const cellKey = `${-1}-${index}`;
      const customStyle = cellStyles?.get(cellKey) || {};
      const columnWidth = columnWidths?.[index] || 150;
      
      const styles = [
        `width: ${columnWidth}px`,
        `border: ${customStyle.borderWidth || 1}px ${customStyle.borderStyle || 'solid'} ${customStyle.borderColor || borderColor}`,
        `padding: ${customStyle.padding || 8}px`,
        `background-color: ${customStyle.backgroundColor || surfaceColor}`,
        `color: ${customStyle.color || textColor}`,
        `text-align: ${customStyle.textAlign || alignments[index] || 'left'}`,
        `font-weight: ${customStyle.fontWeight || 'bold'}`,
        `font-size: ${customStyle.fontSize ? customStyle.fontSize + 'px' : (appSettings?.fontSize || 14) + 'px'}`
      ];
      
      html += `      <th style="${styles.join('; ')}">${header}</th>\n`;
    });
    html += '    </tr>\n  </thead>\n';
    
    // 表体
    html += '  <tbody>\n';
    rows.forEach((row, rowIndex) => {
      const rowBg = appSettings?.alternateRowColors && rowIndex % 2 === 1 ? surfaceColor : bgColor;
      html += '    <tr>\n';
      row.forEach((cell, colIndex) => {
        const cellKey = `${rowIndex}-${colIndex}`;
        const customStyle = cellStyles?.get(cellKey) || {};
        const columnWidth = columnWidths?.[colIndex] || 150;
        
        const styles = [
          `width: ${columnWidth}px`,
          `border: ${customStyle.borderWidth || 1}px ${customStyle.borderStyle || 'solid'} ${customStyle.borderColor || borderColor}`,
          `padding: ${customStyle.padding || 8}px`,
          `background-color: ${customStyle.backgroundColor || rowBg}`,
          `color: ${customStyle.color || textColor}`,
          `text-align: ${customStyle.textAlign || alignments[colIndex] || 'left'}`,
          `font-weight: ${customStyle.fontWeight || 'normal'}`,
          `font-size: ${customStyle.fontSize ? customStyle.fontSize + 'px' : (appSettings?.fontSize || 14) + 'px'}`
        ];
        
        html += `      <td style="${styles.join('; ')}">${cell}</td>\n`;
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