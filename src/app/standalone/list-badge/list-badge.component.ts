import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';

@Component({
  standalone: true,
  imports: [CommonModule, FlexModule],
  selector: 'app-list-badge',
  templateUrl: './list-badge.component.html',
  styleUrls: ['./list-badge.component.scss'],
})
export class ListBadgeComponent {
  @Input() count: number;
}
