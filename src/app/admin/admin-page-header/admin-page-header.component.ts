import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-admin-page-header',
  templateUrl: './admin-page-header.component.html',
  styleUrls: ['./admin-page-header.component.scss'],
  imports: [FlexModule, MatButton, MatIcon, TranslocoPipe],
})
export class AdminPageHeaderComponent {
  @Input({ required: true }) headerText!: string;
  @Input() buttonText?: string;
  @Input() buttonIcon?: string;
  @Output() buttonClicked = new EventEmitter<void>();

  click() {
    this.buttonClicked.emit();
  }
}
