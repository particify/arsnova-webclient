import { Component, Input } from '@angular/core';
import { KeyNavBarItem } from '../control-bar/control-bar.component';
import { KEYBOARD_KEYS, KeyboardKey } from '../../../../utils/keyboard/keys';

@Component({
  selector: 'app-key-button-bar',
  templateUrl: './key-button-bar.component.html',
  styleUrls: ['./key-button-bar.component.scss']
})
export class KeyButtonBarComponent {

  @Input() items: KeyNavBarItem[]
  @Input() withText = true;

  constructor() { }

  sendKeyEvent(key: string) {
    const event = new KeyboardEvent('keyup', {
      key: KEYBOARD_KEYS.get(KeyboardKey[key]).key[0],
    });
    window.dispatchEvent(event);
  }

}
