import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { HintType } from '@app/core/models/hint-type.enum';
import { TranslateModule } from '@ngx-translate/core';

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
  imports: [CommonModule, FlexModule, MatIconModule, TranslateModule],
  selector: 'app-hint',
  templateUrl: './hint.component.html',
  styleUrls: ['./hint.component.scss'],
})
export class HintComponent implements OnInit {
  @Input() text: string;
  @Input() type: HintType = HintType.WARNING;

  hint: Hint;

  ngOnInit(): void {
    this.getHintType();
  }

  getHintType() {
    this.hint = HINTS.find((hint) => hint.type === this.type);
  }
}
