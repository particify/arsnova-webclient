import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { ExtensionPointComponent } from '@projects/extension-point/src/lib/extension-point.component';

@Component({
  selector: 'app-form-header',
  templateUrl: './form-header.component.html',
  styleUrls: ['./form-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FlexModule, ExtensionPointComponent],
})
export class FormHeaderComponent {
  @Input({ required: true }) text!: string;
}
