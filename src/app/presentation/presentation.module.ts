import { NgModule } from '@angular/core';
import { PresentationRoutingModule } from './presentation-routing.module';
import { extensions } from './presentation.extensions';
import { ControlBarComponent } from './bars/control-bar/control-bar.component';
import { ExtensionPointModule } from '@projects/extension-point/src/lib/extension-point.module';
import { PresentationComponent } from './presentation/presentation.component';
import { SharedModule } from '@app/shared/shared.module';
import { TranslocoModule, provideTranslocoScope } from '@ngneat/transloco';
import { QrCodeModule } from 'ng-qrcode';
import { KeyButtonBarComponent } from './bars/key-button-bar/key-button-bar.component';
import { BarNotificationComponent } from './bars/bar-notification/bar-notification.component';
import { QrCodeComponent } from './qr-code/qr-code.component';
import { CoreModule } from '@app/core/core.module';
import { CopyUrlComponent } from '@app/standalone/copy-url/copy-url.component';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';

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
    ExtensionPointModule,
    SharedModule,
    TranslocoModule,
    QrCodeModule,
    CopyUrlComponent,
  ],
  providers: [provideTranslocoScope('creator'), FocusModeService],
})
export class PresentationModule {}
