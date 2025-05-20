import { Component, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { FlexModule } from '@angular/flex-layout';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';

/** Special icon name for spinner animation */
export const LOADING_ICON = '_loading';

@Component({
  selector: 'app-snack-bar-advanced',
  templateUrl: './snack-bar-advanced.component.html',
  styleUrls: ['./snack-bar-advanced.component.scss'],
  imports: [FlexModule, MatProgressSpinner, MatIcon],
})
export class SnackBarAdvancedComponent {
  data = inject(MAT_SNACK_BAR_DATA);

  LOADING_ICON = LOADING_ICON;
}
