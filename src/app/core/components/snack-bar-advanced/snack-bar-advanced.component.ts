import { Component, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

/** Special icon name for spinner animation */
export const LOADING_ICON = '_loading';

@Component({
  selector: 'app-snack-bar-advanced',
  templateUrl: './snack-bar-advanced.component.html',
  styleUrls: ['./snack-bar-advanced.component.scss'],
  standalone: false,
})
export class SnackBarAdvancedComponent {
  data = inject(MAT_SNACK_BAR_DATA);

  LOADING_ICON = LOADING_ICON;
}
