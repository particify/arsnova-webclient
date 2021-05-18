import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ExportFileType } from '../../../../models/export-file-type';

const charsets = [
  'UTF-8',
  'UTF-16LE'
] as const;

type Charset = typeof charsets[number];

export interface ExportOptions {
  exportType: ExportFileType,
  charset: Charset
}

@Component({
  templateUrl: './export.component.html'
})
export class ExportComponent {
  exportTypes = [
    { label: 'export.tsv', value: ExportFileType.TSV },
    { label: 'export.csv', value: ExportFileType.CSV }
  ];
  charsets = charsets;
  selectedExportType = this.exportTypes[0];
  selectedCharset = this.charsets[1];

  constructor(
    protected translateService: TranslateService,
    private dialogRef: MatDialogRef<ExportComponent, ExportOptions>
  ) {
  }

  export() {
    this.dialogRef.close({
      exportType: this.selectedExportType.value,
      charset: this.selectedCharset
    });
  }

  cancel() {
    this.dialogRef.close();
  }
}
