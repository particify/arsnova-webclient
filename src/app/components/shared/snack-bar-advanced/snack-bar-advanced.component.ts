import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

/** Special icon name for spinner animation */
export const LOADING_ICON = '_loading';

@Component({
  selector: 'app-snack-bar-advanced',
  templateUrl: './snack-bar-advanced.html',
  styleUrls: ['./snack-bar-advanced.scss']
})
export class SnackBarAdvancedComponent {
  LOADING_ICON = LOADING_ICON;

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {
  }
}
