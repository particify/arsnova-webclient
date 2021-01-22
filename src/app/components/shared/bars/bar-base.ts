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
  info: BarItem[] = [
    new BarItem('user-count', 'people')
  ];
  headerHeight =  64;
  scrollExtended = false;

  protected constructor() { }

  ngOnInit(): void {
    this.initItems();
  }

  initItems() {
  }

  checkScroll() {
    const currentScroll = document.documentElement.scrollTop;
    this.scrollExtended = currentScroll >= this.headerHeight;
  }
}
