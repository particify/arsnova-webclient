import { Component, Input, Type, ChangeDetectionStrategy } from '@angular/core';
import { Extension } from '@ext-point/extension';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './app-logo.component.svg',
})
export class AppLogoComponent extends Extension {
  @Input() width = '100%';
  @Input() height = '100%';

  getId(): string {
    return 'app-logo';
  }

  getType(): Type<AppLogoComponent> {
    return AppLogoComponent;
  }
}
