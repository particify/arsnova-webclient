import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { HintType } from '@app/core/models/hint-type.enum';
import { TranslocoModule } from '@ngneat/transloco';

export interface Hint {
  type: string;
  icon: string;
  class: string;
}

export const HINTS: Hint[] = [
  {
    type: HintType.WARNING,
    icon: 'warning',
    class: 'warning',
  },
  {
    type: HintType.INFO,
    icon: 'info',
    class: 'info',
  },
];

@Component({
  standalone: true,
  imports: [CommonModule, FlexModule, MatIconModule, TranslocoModule],
  selector: 'app-hint',
  templateUrl: './hint.component.html',
  styleUrls: ['./hint.component.scss'],
})
export class HintComponent implements OnInit {
  @Input() text?: string;
  @Input() type: HintType = HintType.WARNING;

  hint: Hint = HINTS[0];

  ngOnInit(): void {
    this.hint = HINTS.find((hint) => hint.type === this.type)!;
  }
}
