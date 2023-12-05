import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  standalone: true,
  imports: [CommonModule, MatDividerModule, TranslocoModule],
  selector: 'app-menu-divider',
  templateUrl: './menu-divider.component.html',
  styleUrls: ['./menu-divider.component.scss'],
})
export class MenuDividerComponent {
  @Input({ required: true }) label!: string;
}
