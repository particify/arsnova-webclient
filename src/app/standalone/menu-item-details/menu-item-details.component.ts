import { Component, Input } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

@Component({
  selector: 'app-menu-item-details',
  imports: [FlexLayoutModule],
  templateUrl: './menu-item-details.component.html',
  styleUrl: './menu-item-details.component.scss',
})
export class MenuItemDetailsComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) description!: string;
}
