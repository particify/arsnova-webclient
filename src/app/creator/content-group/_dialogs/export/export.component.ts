import { Component, inject } from '@angular/core';
import {
  MatDialogRef,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';

import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { ExportFileType } from '@app/core/models/export-file-type';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { FlexModule } from '@angular/flex-layout';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatOption } from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';

const charsets = ['UTF-8', 'UTF-16LE'] as const;

type Charset = (typeof charsets)[number];

export interface ExportOptions {
  exportType: ExportFileType;
  charset: Charset;
}

@Component({
  templateUrl: './export.component.html',
  imports: [
    CdkScrollable,
    MatDialogContent,
    FlexModule,
    MatFormField,
    MatLabel,
    MatSelect,
    FormsModule,
    MatOption,
    MatDialogActions,
    MatButton,
    TranslocoPipe,
  ],
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
