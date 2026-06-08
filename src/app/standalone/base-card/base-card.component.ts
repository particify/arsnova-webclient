import { CommonModule } from '@angular/common';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';

@Component({
  imports: [CommonModule, FlexModule, MatCardModule],
  selector: 'app-base-card',
  templateUrl: './base-card.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./base-card.component.scss'],
})
export class BaseCardComponent {
  @Input() showShadow = true;
}
