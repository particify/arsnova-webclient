import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CoreModule } from '@app/core/core.module';

@Component({
  imports: [CoreModule, RouterModule],
  selector: 'app-feature-card',
  templateUrl: './feature-card.component.html',
  styleUrls: ['./feature-card.component.scss'],
})
export class FeatureCardComponent {
  @Input({ required: true }) feature!: string;
  @Input({ required: true }) description!: string;
  @Input({ required: true }) icon!: string;
  @Input() url?: string;
  @Input() hotkey?: string;
  @Input() clickable = false;
  @Input() fillFeatureAction = false;
  @Input() countHint?: string;
  @Input() color?: string;
  @Input() stateText?: string;
}
