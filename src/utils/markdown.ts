import { TableData } from '../types/index';

/**
 * Markdown 表格解析器
 */
export class MarkdownTableParser {
  /**
   * 解析 Markdown 表格字符串为表格数据
   */
  static parse(markdown: string): TableData {
    const lines = markdown.trim().split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('Invalid markdown table format');
    }

    // 解析表头
    const headerLine = lines[0];
    const headers = this.parseTableRow(headerLine);

    // 解析对齐方式
    const alignmentLine = lines[1];
    const alignments = this.parseAlignments(alignmentLine);

    // 解析数据行
    const dataLines = lines.slice(2);
    const rows = dataLines.map(line => this.parseTableRow(line));

    return {
      headers,
      rows,
      alignments
    };
  }

  /**
   * 将表格数据序列化为 Markdown 字符串
   */
  static serialize(tableData: TableData): string {
    const { headers, rows, alignments } = tableData;
    
    // 构建表头行
    const headerRow = this.buildTableRow(headers);
    
    // 构建对齐行
    const alignmentRow = this.buildAlignmentRow(alignments);
    
    // 构建数据行
    const dataRows = rows.map(row => this.buildTableRow(row));
    
    return [headerRow, alignmentRow, ...dataRows].join('\n');
  }

  /**
   * 解析表格行
   */
  private static parseTableRow(line: string): string[] {
    // 移除首尾的 | 符号并分割
    const trimmed = line.trim();
    const withoutBorders = trimmed.startsWith('|') ? trimmed.slice(1) : trimmed;
    const withoutEndBorder = withoutBorders.endsWith('|') ? withoutBorders.slice(0, -1) : withoutBorders;
    
    return withoutEndBorder.split('|').map(cell => cell.trim());
  }

  /**
   * 解析对齐方式
   */
  private static parseAlignments(line: string): ('left' | 'center' | 'right')[] {
    const cells = this.parseTableRow(line);
    
    return cells.map(cell => {
      const trimmed = cell.trim();
      if (trimmed.startsWith(':') && trimmed.endsWith(':')) {
        return 'center';
      } else if (trimmed.endsWith(':')) {
        return 'right';
      } else {
        return 'left';
      }
    });
  }

  /**
   * 构建表格行
   */
  private static buildTableRow(cells: string[]): string {
    return `| ${cells.join(' | ')} |`;
  }

  /**
   * 构建对齐行
   */
  private static buildAlignmentRow(alignments: ('left' | 'center' | 'right')[]): string {
    const alignmentCells = alignments.map(alignment => {
      switch (alignment) {
        case 'center':
          return ':---:';
        case 'right':
          return '---:';
        default:
          return '---';
      }
    });
    
    return this.buildTableRow(alignmentCells);
  }

  /**
   * 验证 Markdown 表格格式
   */
  static validate(markdown: string): boolean {
    try {
      this.parse(markdown);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 格式化 Markdown 表格（美化对齐）
   */
  static format(markdown: string): string {
    try {
      const tableData = this.parse(markdown);
      return this.serialize(tableData);
    } catch {
      return markdown;
    }
  }

  /**
   * 创建空表格
   */
  static createEmpty(rows: number = 3, cols: number = 3): TableData {
    const headers = Array(cols).fill(0).map((_, i) => `Header ${i + 1}`);
    const tableRows = Array(rows).fill(0).map(() => 
      Array(cols).fill(0).map(() => '')
    );
    const alignments = Array(cols).fill('left') as ('left' | 'center' | 'right')[];

    return {
      headers,
      rows: tableRows,
      alignments
    };
  }

  /**
   * 添加行
   */
  static addRow(tableData: TableData, index?: number): TableData {
    const { headers, rows, alignments } = tableData;
    const newRow = Array(headers.length).fill('');
    const newRows = [...rows];
    
    if (index !== undefined && index >= 0 && index <= rows.length) {
      newRows.splice(index, 0, newRow);
    } else {
      newRows.push(newRow);
    }

    return {
      headers,
      rows: newRows,
      alignments
    };
  }

  /**
   * 删除行
   */
  static removeRow(tableData: TableData, index: number): TableData {
    const { headers, rows, alignments } = tableData;
    
    if (index < 0 || index >= rows.length) {
      return tableData;
    }

    const newRows = rows.filter((_, i) => i !== index);

    return {
      headers,
      rows: newRows,
      alignments
    };
  }

  /**
   * 添加列
   */
  static addColumn(tableData: TableData, index?: number): TableData {
    const { headers, rows, alignments } = tableData;
    const newHeaders = [...headers];
    const newAlignments = [...alignments];
    
    const insertIndex = index !== undefined && index >= 0 && index <= headers.length ? index : headers.length;
    
    newHeaders.splice(insertIndex, 0, `Header ${headers.length + 1}`);
    newAlignments.splice(insertIndex, 0, 'left');
    
    const newRows = rows.map(row => {
      const newRow = [...row];
      newRow.splice(insertIndex, 0, '');
      return newRow;
    });

    return {
      headers: newHeaders,
      rows: newRows,
      alignments: newAlignments
    };
  }

  /**
   * 删除列
   */
  static removeColumn(tableData: TableData, index: number): TableData {
    const { headers, rows, alignments } = tableData;
    
    if (index < 0 || index >= headers.length || headers.length <= 1) {
      return tableData;
    }

    const newHeaders = headers.filter((_, i) => i !== index);
    const newAlignments = alignments.filter((_, i) => i !== index);
    const newRows = rows.map(row => row.filter((_, i) => i !== index));

    return {
      headers: newHeaders,
      rows: newRows,
      alignments: newAlignments
    };
  }

  /**
   * 更新单元格内容
   */
  static updateCell(tableData: TableData, row: number, col: number, value: string): TableData {
    const { headers, rows, alignments } = tableData;
    
    if (row === -1) {
      // 更新表头
      if (col >= 0 && col < headers.length) {
        const newHeaders = [...headers];
        newHeaders[col] = value;
        return {
          headers: newHeaders,
          rows,
          alignments
        };
      }
    } else if (row >= 0 && row < rows.length && col >= 0 && col < rows[row].length) {
      // 更新数据单元格
      const newRows = [...rows];
      newRows[row] = [...newRows[row]];
      newRows[row][col] = value;
      return {
        headers,
        rows: newRows,
        alignments
      };
    }
    
    return tableData;
  }

  /**
   * 更新列对齐方式
   */
  static updateAlignment(tableData: TableData, col: number, alignment: 'left' | 'center' | 'right'): TableData {
    const { headers, rows, alignments } = tableData;
    
    if (col >= 0 && col < alignments.length) {
      const newAlignments = [...alignments];
      newAlignments[col] = alignment;
      return {
        headers,
        rows,
        alignments: newAlignments
      };
    }
    
    return tableData;
  }
}

/**
 * 转义 Markdown 特殊字符
 */
export function escapeMarkdown(text: string): string {
  return text.replace(/[|\\`*_{}[\]()#+\-.!]/g, '\\$&');
}

/**
 * 反转义 Markdown 特殊字符
 */
export function unescapeMarkdown(text: string): string {
  return text.replace(/\\([|\\`*_{}[\]()#+\-.!])/g, '$1');
}

/**
 * 检测文本是否包含 Markdown 表格
 */
export function containsMarkdownTable(text: string): boolean {
  const lines = text.split('\n');
  let foundTable = false;
  
  for (let i = 0; i < lines.length - 1; i++) {
    const currentLine = lines[i].trim();
    const nextLine = lines[i + 1].trim();
    
    // 检查是否有表格行格式
    if (currentLine.includes('|') && nextLine.match(/^\s*\|?\s*:?-+:?\s*\|/)) {
      foundTable = true;
      break;
    }
  }
  
  return foundTable;
}

/**
 * 提取文本中的所有 Markdown 表格
 */
export function extractMarkdownTables(text: string): string[] {
  const lines = text.split('\n');
  const tables: string[] = [];
  let currentTable: string[] = [];
  let inTable = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    if (trimmedLine.includes('|')) {
      if (!inTable) {
        // 检查下一行是否是对齐行
        const nextLine = lines[i + 1]?.trim();
        if (nextLine && nextLine.match(/^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?$/)) {
          inTable = true;
          currentTable = [line];
        }
      } else {
        currentTable.push(line);
      }
    } else if (inTable && trimmedLine === '') {
      // 空行结束表格
      if (currentTable.length > 0) {
        tables.push(currentTable.join('\n'));
        currentTable = [];
      }
      inTable = false;
    } else if (inTable) {
      // 非表格行结束表格
      if (currentTable.length > 0) {
        tables.push(currentTable.join('\n'));
        currentTable = [];
      }
      inTable = false;
    }
  }
  
  // 处理文档末尾的表格
  if (inTable && currentTable.length > 0) {
    tables.push(currentTable.join('\n'));
  }
  
  return tables;
}