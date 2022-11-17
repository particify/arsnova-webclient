import { Component, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Hotkey, HotkeyActionType } from '../../../../services/util/hotkey.service';

@Component({
  selector: 'app-hotkeys',
  templateUrl: './hotkeys.component.html',
  styleUrls: ['./hotkeys.component.scss']
})
export class HotkeysComponent {
  readonly dialogId = 'hotkeys';

  displayedColumns = ['action', 'keys'];
  HotkeyActionType = HotkeyActionType;

  constructor(@Inject(MAT_DIALOG_DATA) public hotkeys: Hotkey[]) { }
}
