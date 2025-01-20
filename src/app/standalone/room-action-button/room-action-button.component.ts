import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CoreModule } from '@app/core/core.module';

@Component({
  imports: [CoreModule, RouterModule],
  selector: 'app-room-action-button',
  templateUrl: './room-action-button.component.html',
  styleUrls: ['./room-action-button.component.scss'],
})
export class RoomActionButtonComponent {
  @Input({ required: true }) feature!: string;
  @Input() url?: string;
  @Input({ required: true }) icon!: string;
  @Input({ required: true }) hotkey!: string;
  @Input() badgeCounter?: number;
}
