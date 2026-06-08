import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-pulsating-circle',
  standalone: true,
  templateUrl: './pulsating-circle.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './pulsating-circle.component.scss',
})
export class PulsatingCircleComponent {
  @Input() size = 8;
}
