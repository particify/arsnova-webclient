import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  standalone: true,
  imports: [CommonModule, FlexModule, MatProgressSpinnerModule],
  selector: 'app-loading-indicator',
  templateUrl: './loading-indicator.component.html',
  styleUrls: ['./loading-indicator.component.scss'],
})
export class LoadingIndicatorComponent implements OnInit {
  @Input() size = 40;
  @Input() height;
  @Input() disabled = false;

  ngOnInit(): void {
    if (!this.height) {
      this.height = (this.size * 2).toString() + 'px';
    }
  }
}
