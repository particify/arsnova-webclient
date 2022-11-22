import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-settings-panel-header',
  templateUrl: './settings-panel-header.component.html',
  styleUrls: ['./settings-panel-header.component.scss']
})
export class SettingsPanelHeaderComponent {

  @Input() text;
  @Input() icon;
}
