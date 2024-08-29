import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }
  //json to xlsx
  public exportAsExcelFile(json: any[], excelFileName: string,type): void {
    
    const myworksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const myworkbook: XLSX.WorkBook = { Sheets: { 'data': myworksheet }, SheetNames: ['data'] };
    if(type == 'xlsx'){
      const excelBuffer: any = XLSX.write(myworkbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsXLSXFile(excelBuffer, excelFileName);
    }
    if(type == 'xls'){
      const excelBuffer: any = XLSX.write(myworkbook, { bookType: 'xls', type: 'array' });
      this.saveAsXLSFile(excelBuffer, excelFileName);
    }
    if(type == 'csv'){
      const excelBuffer: any = XLSX.write(myworkbook, { bookType: 'csv', type: 'array' });
      this.saveAsCSVFile(excelBuffer, excelFileName);
    }
  }

  private saveAsXLSXFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '.xlsx');
  }

  private saveAsXLSFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '.xls');
  }

  private saveAsCSVFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '.csv');
  }
  //json to .csv
  downloadFileCSV(data: any, filename:string) {
    const replacer = (key, value) => value === null ? '' : value;
    const header = Object.keys(data[0]);
    let csv = data.map(row => header.map(fieldName => JSON.stringify(row[fieldName],replacer)).join(','));
    csv.unshift(header.join(','));
    let csvArray = csv.join('\r\n');
    var blob = new Blob([csvArray], {type: 'text/csv' })
    FileSaver.saveAs(blob, filename + ".csv");
}
  
}
