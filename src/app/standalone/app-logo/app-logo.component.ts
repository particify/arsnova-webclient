import { Component, Input, Type } from '@angular/core';
import { Extension } from '@ext-point/extension';

@Component({
  // The component cannot be declared as standalone because it needs to be
  // provided by a module for dependency injection.
  standalone: false,
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
