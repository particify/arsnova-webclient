import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { HotkeyAction } from '@app/core/directives/hotkey.directive';

export const hotkeyEnterLeaveAnimation = trigger('hotkeyEnterLeaveAnimation', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('100ms', style({ opacity: 1 })),
  ]),
  transition(':leave', [animate('100ms', style({ opacity: 0 }))]),
]);

@Component({
  selector: 'app-hotkey-action-button',
  standalone: true,
  imports: [CoreModule],
  templateUrl: './hotkey-action-button.component.html',
  styleUrl: './hotkey-action-button.component.scss',
})
export class HotkeyActionButtonComponent {
  @Input({ required: true }) hotkey!: string;
  @Input({ required: true }) hotkeyTitle!: string;
  @Input({ required: true }) action!: string;
  @Input() infoLabel?: string;
  @Input() infoIcon?: string;
  @Input() isNavBarVisible = true;
  @Output() buttonClicked = new EventEmitter<void>();

  hotkeyAction = HotkeyAction.CLICK;
}
