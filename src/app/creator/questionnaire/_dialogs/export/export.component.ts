import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import {
  MatDialogRef,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';

import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import {
  DELIMITED_TEXT_CHARSETS,
  DelimitedTextCharset,
} from '@app/core/utils/delimited-text';
import { DelimitedTextFormat } from '@app/core/models/delimited-text-format';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { FlexModule } from '@angular/flex-layout';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatOption } from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';

export interface ExportOptions {
  exportType: DelimitedTextFormat;
  charset: DelimitedTextCharset;
}

@Component({
  templateUrl: './export.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
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
    { label: 'creator.export.tsv', value: DelimitedTextFormat.TSV },
    { label: 'creator.export.csv', value: DelimitedTextFormat.CSV },
  ];
  charsets = DELIMITED_TEXT_CHARSETS;
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
