import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-loading-indicator',
  templateUrl: './loading-indicator.component.html',
})
export class LoadingIndicatorComponent implements OnInit {
  @Input() size = 40;
  @Input() height;

  ngOnInit(): void {
    if (!this.height) {
      this.height = (this.size * 2).toString() + 'px';
    }
  }
}
