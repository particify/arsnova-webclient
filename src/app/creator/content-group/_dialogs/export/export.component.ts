import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { TranslocoService } from '@jsverse/transloco';
import { ExportFileType } from '@app/core/models/export-file-type';

const charsets = ['UTF-8', 'UTF-16LE'] as const;

type Charset = (typeof charsets)[number];

export interface ExportOptions {
  exportType: ExportFileType;
  charset: Charset;
}

@Component({
  templateUrl: './export.component.html',
  standalone: false,
})
export class ExportComponent {
  protected translateService = inject(TranslocoService);
  private dialogRef =
    inject<MatDialogRef<ExportComponent, ExportOptions>>(MatDialogRef);

  readonly dialogId = 'export';

  exportTypes = [
    { label: 'creator.export.tsv', value: ExportFileType.TSV },
    { label: 'creator.export.csv', value: ExportFileType.CSV },
  ];
  charsets = charsets;
  selectedExportType = this.exportTypes[0];
  selectedCharset = this.charsets[1];

  export() {
    this.dialogRef.close({
      exportType: this.selectedExportType.value,
      charset: this.selectedCharset,
    });
  }

  cancel() {
    this.dialogRef.close();
  }
}
