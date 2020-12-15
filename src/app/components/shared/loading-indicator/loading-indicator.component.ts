import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-loading-indicator',
  templateUrl: './loading-indicator.component.html',
  styleUrls: ['./loading-indicator.component.scss']
})
export class LoadingIndicatorComponent implements OnInit {

  @Input() size = 100;
  @Input() height;

  constructor() { }

  ngOnInit(): void {
    if (!this.height) {
      this.height = (this.size * 2).toString() + 'px';
    }
  }

}
