import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-bar-notification',
  templateUrl: './bar-notification.component.html',
  styleUrls: ['./bar-notification.component.scss'],
})
export class BarNotificationComponent {
  @Input({ required: true }) message!: string;
  @Input({ required: true }) icon!: string;
  @Input() expanded = false;
  @Input() hidden = true;
}
