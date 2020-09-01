import { Component, Input, OnInit } from '@angular/core';

export class SidebarInfo {
  count: number;
  icon: string;
  name: string;

  constructor(count: number, icon: string, name: string) {
    this.count = count;
    this.icon = icon;
    this.name = name;
  }
}


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})

export class SidebarComponent implements OnInit {

  @Input() sidebarInfos: SidebarInfo[];
  isLoading = true;

  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      this.isLoading = false;
    }, 50);
  }

}
