import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pulsating-circle',
  standalone: true,
  templateUrl: './pulsating-circle.component.html',
  styleUrl: './pulsating-circle.component.scss',
})
export class PulsatingCircleComponent {
  @Input() size = 8;
}
