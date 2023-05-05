import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CoreModule } from '@app/core/core.module';

@Component({
  standalone: true,
  imports: [CoreModule, RouterModule],
  selector: 'app-room-action-button',
  templateUrl: './room-action-button.component.html',
  styleUrls: ['./room-action-button.component.scss'],
})
export class RoomActionButtonComponent {
  @Input() feature: string;
  @Input() url: string;
  @Input() icon: string;
  @Input() hotkey: string;
  @Input() badgeCounter: number;
}
