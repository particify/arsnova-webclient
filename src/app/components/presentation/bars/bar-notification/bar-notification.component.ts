import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-bar-notification',
  templateUrl: './bar-notification.component.html',
  styleUrls: ['./bar-notification.component.scss']
})
export class BarNotificationComponent {

  @Input() message: string;
  @Input() icon: string;
  @Input() expanded = false;
  @Input() hidden = true;

  constructor() { }

}
