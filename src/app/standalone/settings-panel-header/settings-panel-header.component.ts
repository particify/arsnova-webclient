import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatIconModule,
    MatExpansionModule,
    FlexModule,
  ],
  selector: 'app-settings-panel-header',
  templateUrl: './settings-panel-header.component.html',
  styleUrls: ['./settings-panel-header.component.scss'],
})
export class SettingsPanelHeaderComponent {
  @Input() text;
  @Input() icon;
}
