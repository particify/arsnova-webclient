import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  standalone: true,
  imports: [CommonModule, FlexModule, TranslocoModule],
  selector: 'app-answer-count',
  templateUrl: './answer-count.component.html',
  styleUrls: ['./answer-count.component.scss'],
})
export class AnswerCountComponent {
  @Input({ required: true }) count!: number;
  @Input() size?: string;
}
