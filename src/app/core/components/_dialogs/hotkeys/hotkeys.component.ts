import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import {
  Hotkey,
  HotkeyActionType,
} from '@app/core/services/util/hotkey.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import {
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow,
} from '@angular/material/table';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-hotkeys',
  templateUrl: './hotkeys.component.html',
  styleUrls: ['./hotkeys.component.scss'],
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    TranslocoPipe,
  ],
})
export class HotkeysComponent {
  hotkeys = inject<Hotkey[]>(MAT_DIALOG_DATA);

  readonly dialogId = 'hotkeys';

  displayedColumns = ['action', 'keys'];
  HotkeyActionType = HotkeyActionType;
}
