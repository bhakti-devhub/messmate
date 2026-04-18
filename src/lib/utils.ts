import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function downloadPdf(
  title: string,
  headers: string[],
  data: any[],
  filename: string
) {
  if (!data || data.length === 0) {
    console.warn('No data to download.');
    return;
  }

  const doc = new jsPDF();

  // Add title
  doc.text(title, 14, 15);

  // Prepare table data
  const tableColumn = headers;
  const tableRows: any[][] = [];

  const keys = headers.map(h => h.toLowerCase().replace(/ /g, ''));

  data.forEach(item => {
    const rowData = keys.map(key => {
        const keysToTry = [key, key.replace('id', ''), key.replace('name', '')]; 
        let value = '';
        for (const k of keysToTry) {
            if (item[k] !== undefined) {
                value = item[k];
                break;
            }
        }
        return String(value ?? '');
    });
    tableRows.push(rowData);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 20,
  });

  doc.save(filename);
}


export function downloadCsv(data: any[], headers: string[], filename: string) {
    if (!data || data.length === 0) {
        console.warn("No data to download.");
        return;
    }

    const processRow = (row: any) => headers.map(header => {
        const key = header.toLowerCase().replace(/ /g, '');
        // A bit of a hack to match keys, but works for this structure.
        const keysToTry = [key, key.replace('id', ''), key.replace('name', '')]; 
        
        let value = '';
        for (const k of keysToTry) {
            if (row[k] !== undefined) {
                value = row[k];
                break;
            }
        }

        if (Array.isArray(value)) {
            value = value.map(item => item.name || item).join(', ');
        }
        
        const stringValue = String(value ?? '').replace(/"/g, '""');
        return `"${stringValue}"`;
    }).join(',');

    const csvContent = [
        headers.join(','),
        ...data.map(processRow)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
