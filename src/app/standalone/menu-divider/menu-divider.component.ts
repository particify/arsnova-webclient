import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  imports: [CommonModule, MatDividerModule, TranslateModule],
  selector: 'app-menu-divider',
  templateUrl: './menu-divider.component.html',
  styleUrls: ['./menu-divider.component.scss'],
})
export class MenuDividerComponent {
  @Input() label: string;
}
