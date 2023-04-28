import { NgModule } from '@angular/core';
import { PresentationRoutingModule } from './presentation-routing.module';
import { extensions } from './presentation.extensions';
import { ControlBarComponent } from './bars/control-bar/control-bar.component';
import { ExtensionPointModule } from '@projects/extension-point/src/lib/extension-point.module';
import { PresentationComponent } from './presentation/presentation.component';
import { SharedModule } from '@app/shared/shared.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoaderFactory } from '@app/translate-http-loader-factory';
import { HttpClient } from '@angular/common/http';
import { TRANSLATION_MODULE_NAME } from '@app/translate-module-name-token';
import { QrCodeModule } from 'ng-qrcode';
import { KeyButtonBarComponent } from './bars/key-button-bar/key-button-bar.component';
import { BarNotificationComponent } from './bars/bar-notification/bar-notification.component';
import { QrCodeComponent } from './qr-code/qr-code.component';
import { CreatorModule } from '@app/creator/creator.module';
import { CoreModule } from '@app/core/core.module';

@NgModule({
  declarations: [
    ControlBarComponent,
    PresentationComponent,
    KeyButtonBarComponent,
    BarNotificationComponent,
    QrCodeComponent,
  ],
  imports: [
    extensions,
    PresentationRoutingModule,
    CoreModule,
    CreatorModule,
    ExtensionPointModule,
    SharedModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: TranslateHttpLoaderFactory,
        deps: [HttpClient, TRANSLATION_MODULE_NAME],
      },
      isolate: true,
    }),
    QrCodeModule,
  ],
})
export class PresentationModule {}
