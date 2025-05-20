import { NgModule } from '@angular/core';
import { PresentationRoutingModule } from './presentation-routing.module';
import { extensions } from './presentation.extensions';
import { ControlBarComponent } from './bars/control-bar/control-bar.component';
import { ExtensionPointModule } from '@projects/extension-point/src/lib/extension-point.module';
import { PresentationComponent } from './presentation/presentation.component';
import { TranslocoModule, provideTranslocoScope } from '@jsverse/transloco';
import { QrCodeModule } from 'ng-qrcode';
import { KeyButtonBarComponent } from './bars/key-button-bar/key-button-bar.component';
import { CoreModule } from '@app/core/core.module';
import { CopyUrlComponent } from '@app/standalone/copy-url/copy-url.component';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { HotkeyActionButtonComponent } from '@app/standalone/hotkey-action-button/hotkey-action-button.component';
import { PublishContentGroupDialogComponent } from '@app/presentation/_dialogs/publish-content-group-dialog/publish-content-group-dialog.component';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { ContentPresentationMenuComponent } from '@app/standalone/content-presentation-menu/content-presentation-menu.component';
import { CommentFilterComponent } from '@app/standalone/comment-filter/comment-filter.component';

@NgModule({
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
    ContentPresentationMenuComponent,
    CommentFilterComponent,
    PublishContentGroupDialogComponent,
    ControlBarComponent,
    PresentationComponent,
    KeyButtonBarComponent,
  ],
  providers: [provideTranslocoScope('creator'), FocusModeService],
})
export class PresentationModule {}
