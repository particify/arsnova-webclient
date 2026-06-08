import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  imports: [TranslocoModule, MatIconModule, MatExpansionModule, FlexModule],
  selector: 'app-settings-panel-header',
  templateUrl: './settings-panel-header.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./settings-panel-header.component.scss'],
})
export class SettingsPanelHeaderComponent {
  @Input({ required: true }) text!: string;
  @Input({ required: true }) icon!: string;
}
