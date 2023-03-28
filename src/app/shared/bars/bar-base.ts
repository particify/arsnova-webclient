import { Component, Input, OnInit } from '@angular/core';

export class BarItem {
  name: string;
  icon: string;

  constructor(name: string, icon: string) {
    this.name = name;
    this.icon = icon;
  }
}

@Component({
  template: '',
})
export abstract class BarBaseComponent implements OnInit {
  @Input() barItems: BarItem[] = [];
  @Input() position = 'left';
  @Input() isPresentation = false;

  info: BarItem[] = [];

  ngOnInit(): void {
    this.initItems();
  }

  initItems() {
    // Implementation in extended classes
  }
}
