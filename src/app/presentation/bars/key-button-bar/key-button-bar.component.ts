import { DOCUMENT, NgClass } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { KeyNavBarItem } from '@app/presentation/bars/control-bar/control-bar.component';
import { FlexModule } from '@angular/flex-layout';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { MatRipple } from '@angular/material/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-key-button-bar',
  templateUrl: './key-button-bar.component.html',
  styleUrls: ['./key-button-bar.component.scss'],
  imports: [
    FlexModule,
    NgClass,
    ExtendedModule,
    MatRipple,
    MatTooltip,
    MatIcon,
    TranslocoPipe,
  ],
})
export class KeyButtonBarComponent {
  private document = inject<Document>(DOCUMENT);

  @Input({ required: true }) items!: KeyNavBarItem[];
  @Input() withText = true;

  sendKeyEvent(key: string) {
    const event = new KeyboardEvent('keydown', {
      key: key,
    });
    this.document.documentElement.dispatchEvent(event);
  }
}
