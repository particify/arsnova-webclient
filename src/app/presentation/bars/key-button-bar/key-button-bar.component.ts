import { DOCUMENT } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';
import { KeyNavBarItem } from '@app/presentation/bars/control-bar/control-bar.component';

@Component({
  selector: 'app-key-button-bar',
  templateUrl: './key-button-bar.component.html',
  styleUrls: ['./key-button-bar.component.scss'],
  standalone: false,
})
export class KeyButtonBarComponent {
  @Input({ required: true }) items!: KeyNavBarItem[];
  @Input() withText = true;

  constructor(@Inject(DOCUMENT) private document: Document) {}

  sendKeyEvent(key: string) {
    const event = new KeyboardEvent('keydown', {
      key: key,
    });
    this.document.documentElement.dispatchEvent(event);
  }
}
