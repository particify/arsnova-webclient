import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'snack-bar-advanced',
  templateUrl: './snack-bar-advanced.html',
  styleUrls: ['./snack-bar-advanced.scss']
})

export class SnackBarAdvancedComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {
  }
}
