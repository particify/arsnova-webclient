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
  template: ''
})
export abstract class BarBaseComponent implements OnInit {

  @Input() barItems: BarItem[] = [];
  @Input() position = 'left';
  @Input() isPresentation = false;

  info: BarItem[] = [
    new BarItem('user-count', 'people')
  ];
  headerHeight: number;
  scrollExtended = false;

  protected constructor() { }

  ngOnInit(): void {
    this.headerHeight = this.isPresentation ? 0 : 64;
    this.initItems();
  }

  initItems() {
  }

  checkScroll() {
    const currentScroll = document.documentElement.scrollTop;
    this.scrollExtended = currentScroll >= this.headerHeight;
  }
}
