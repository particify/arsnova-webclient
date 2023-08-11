import { NgModule } from '@angular/core';
import { AppLogoComponent } from './app-logo.component';
import { Extension } from '@ext-point/extension';

// While AppLogo is basically a standalone component, a module is needed to
// provide it as Extension for dependency injection. This way, the module can
// be easily replaced with an alternative implementation.
@NgModule({
  declarations: [AppLogoComponent],
  exports: [AppLogoComponent],
  providers: [{ provide: Extension, useClass: AppLogoComponent, multi: true }],
})
export class AppLogoModule {}
