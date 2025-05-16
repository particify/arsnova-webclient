import { Location } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  imports: [MatButtonModule, MatIconModule],
})
export class BackButtonComponent {
  private location = inject(Location);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  @Input({ required: true }) text!: string;
  @Input() backRoute?: string[];

  goBack() {
    if (this.backRoute) {
      this.router.navigate(this.backRoute, {
        relativeTo: this.route,
      });
    } else {
      this.location.back();
    }
  }
}
