import { NgModule } from '@angular/core';
import { PresentationRoutingModule } from './presentation-routing.module';
import { extensions } from './presentation.extensions';
import { ControlBarComponent } from './bars/control-bar/control-bar.component';
import { ExtensionPointModule } from '@projects/extension-point/src/lib/extension-point.module';
import { PresentationComponent } from './presentation/presentation.component';
import { TranslocoModule, provideTranslocoScope } from '@ngneat/transloco';
import { QrCodeModule } from 'ng-qrcode';
import { KeyButtonBarComponent } from './bars/key-button-bar/key-button-bar.component';
import { QrCodeComponent } from './qr-code/qr-code.component';
import { CoreModule } from '@app/core/core.module';
import { CopyUrlComponent } from '@app/standalone/copy-url/copy-url.component';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { HotkeyActionButtonComponent } from '@app/standalone/hotkey-action-button/hotkey-action-button.component';
import { PublishContentGroupDialogComponent } from '@app/presentation/_dialogs/publish-content-group-dialog/publish-content-group-dialog.component';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';

@NgModule({
  declarations: [
    ControlBarComponent,
    PresentationComponent,
    KeyButtonBarComponent,
    QrCodeComponent,
    PublishContentGroupDialogComponent,
  ],
  imports: [
    extensions,
    PresentationRoutingModule,
    CoreModule,
    ExtensionPointModule,
    TranslocoModule,
    QrCodeModule,
    CopyUrlComponent,
    HotkeyActionButtonComponent,
    LoadingButtonComponent,
  ],
  providers: [provideTranslocoScope('creator'), FocusModeService],
})
export class PresentationModule {}
