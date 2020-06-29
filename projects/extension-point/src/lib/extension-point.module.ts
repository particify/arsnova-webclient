import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExtensionPointComponent } from './extension-point.component';
import { ExtensionFactory } from './extension-factory';

@NgModule({
  imports: [
    CommonModule
  ],
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
