import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExtensionPointComponent } from './extension-point.component';
import { ExtensionFactory } from './extension-factory';
import { ExtensionRouteProvider, RouteMountPoint } from './extension-route';

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
    ExtensionFactory,
    {
      provide: ExtensionRouteProvider,
      useFactory: () => new ExtensionRouteProvider(RouteMountPoint.ROOT, []),
      multi: true
    }
  ]
})
export class ExtensionPointModule {
}
