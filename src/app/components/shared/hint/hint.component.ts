import { Component, Input, OnInit } from '@angular/core';

export interface Hint {
  type: string;
  icon: string;
  class: string;
}

export enum HINT_TYPES {
  WARNING = 'WARNING',
  INFO = 'INFO',
}

export const HINTS: Hint[] = [
  {
    type: HINT_TYPES.WARNING,
    icon: 'warning',
    class: 'warning',
  },
  {
    type: HINT_TYPES.INFO,
    icon: 'info',
    class: 'info',
  },
];

@Component({
  selector: 'app-hint',
  templateUrl: './hint.component.html',
  styleUrls: ['./hint.component.scss'],
})
export class HintComponent implements OnInit {
  @Input() text: string;
  @Input() type: HINT_TYPES = HINT_TYPES.WARNING;

  hint: Hint;

  ngOnInit(): void {
    this.getHintType();
  }

  getHintType() {
    this.hint = HINTS.find((hint) => hint.type === this.type);
  }
}
