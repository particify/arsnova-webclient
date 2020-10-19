import { Component, Input, OnInit } from '@angular/core';

export interface Hint {
  type: string;
  icon: string;
  class: string;
}

export enum HINT_TYPES {
  WARNING = 'WARNING'
}

export const HINTS: Hint[] = [
  {
    type: HINT_TYPES.WARNING,
    icon: 'warning',
    class: 'warning'
  }
];

@Component({
  selector: 'app-hint',
  templateUrl: './hint.component.html',
  styleUrls: ['./hint.component.scss']
})
export class HintComponent implements OnInit {

  @Input() text: string;
  @Input() type: HINT_TYPES;

  hint: Hint;

  constructor() { }

  ngOnInit(): void {
    this.getHintType();
  }

  getHintType() {
    this.hint = HINTS.find(hint => hint.type === this.type);
  }

}
