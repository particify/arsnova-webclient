import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-list-badge',
  templateUrl: './list-badge.component.html',
  styleUrls: ['./list-badge.component.scss']
})
export class ListBadgeComponent {

  @Input() count: number;

  constructor() { }

}
