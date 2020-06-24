import { NgModule } from '@angular/core';
import { ExtensionPointComponent } from './extension-point.component';
import { ExtensionFactory } from './extension-factory';

@NgModule({
  declarations: [
    ExtensionPointComponent
  ],
  exports: [
    ExtensionPointComponent
  ],
  entryComponents: [
    ExtensionPointComponent
  ],
  providers: [
    ExtensionFactory
  ]
})
export class ExtensionPointModule {
}
