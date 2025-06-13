import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { Room } from '@app/core/models/room';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { RoomService } from '@app/core/services/http/room.service';
import { Router } from '@angular/router';
import { EventService } from '@app/core/services/util/event.service';
import { RoomDeleted } from '@app/core/models/events/room-deleted';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  FormattingService,
  MarkdownFeatureset,
} from '@app/core/services/http/formatting.service';
import { HintType } from '@app/core/models/hint-type.enum';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { FormComponent } from '@app/standalone/form/form.component';
import { MatTabChangeEvent, MatTabGroup, MatTab } from '@angular/material/tabs';
import { take, takeUntil } from 'rxjs';
import { FlexModule } from '@angular/flex-layout';
import { MatFormField, MatLabel, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { FormattingToolbarComponent } from '@app/standalone/formatting-toolbar/formatting-toolbar.component';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Dir } from '@angular/cdk/bidi';
import { HintComponent } from '@app/standalone/hint/hint.component';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { LanguageContextDirective } from '@app/core/directives/language-context.directive';
import { TemplateLanguageSelectionComponent } from '@app/standalone/template-language-selection/template-language-selection.component';
import { FeatureFlagDirective } from '@app/core/directives/feature-flag.directive';
import { SettingsSlideToggleComponent } from '@app/standalone/settings-slide-toggle/settings-slide-toggle.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { UpdateEvent } from '@app/creator/settings/update-event';
import { RoomSettingsService } from '@app/core/services/http/room-settings.service';

@Component({
  selector: 'app-room-edit',
  templateUrl: './room.component.html',
  imports: [
    FlexModule,
    MatFormField,
    MatLabel,
    MatInput,
    FormsModule,
    MatHint,
    MatTabGroup,
    MatTab,
    FormattingToolbarComponent,
    CdkTextareaAutosize,
    Dir,
    HintComponent,
    RenderedTextComponent,
    LanguageContextDirective,
    TemplateLanguageSelectionComponent,
    FeatureFlagDirective,
    SettingsSlideToggleComponent,
    MatButton,
    MatIcon,
    LoadingButtonComponent,
    TranslocoPipe,
  ],
})
export class RoomComponent extends FormComponent implements OnInit {
  notificationService = inject(NotificationService);
  translationService = inject(TranslocoService);
  protected roomService = inject(RoomService);
  router = inject(Router);
  eventService = inject(EventService);
  protected translateService = inject(TranslocoService);
  private dialogService = inject(DialogService);
  private formattingService = inject(FormattingService);
  private focusModeService = inject(FocusModeService);
  protected roomSettingsService = inject(RoomSettingsService);

  @Output() saveEvent: EventEmitter<UpdateEvent> =
    new EventEmitter<UpdateEvent>();

  @Input({ required: true }) editRoom!: Room;
  @Input({ required: true }) name!: string;
  @Input({ required: true }) description!: string;
  @Input() isCreator = false;
  markdownFeatureset = MarkdownFeatureset.EXTENDED;
  renderPreview = false;
  textContainsImage = false;
  HintType = HintType;
  focusModeEnabled = false;

  ngOnInit(): void {
    this.roomSettingsService
      .getByRoomId(this.editRoom.id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((settings) => {
        this.focusModeEnabled = settings.focusModeEnabled;
      });
  }

  deleteRoom(): void {
    const dialogRef = this.dialogService.openDeleteDialog(
      'room',
      'dialog.really-delete-room',
      this.editRoom.name,
      undefined,
      () => this.roomService.deleteRoom(this.editRoom.id)
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.translationService
          .selectTranslate('creator.settings.deleted')
          .pipe(take(1))
          .subscribe((msg) => {
            this.notificationService.showAdvanced(
              this.editRoom.name + msg,
              AdvancedSnackBarTypes.WARNING
            );
          });
        const event = new RoomDeleted(this.editRoom.id);
        this.eventService.broadcast(event.type, event.payload);
        this.router.navigateByUrl('user');
      }
    });
  }

  saveChanges() {
    this.editRoom.name = this.name;
    this.editRoom.description = this.description;
    this.saveEvent.emit(new UpdateEvent(this.editRoom, true));
  }

  descriptionTabChanged($event: MatTabChangeEvent) {
    this.renderPreview = $event.index === 1;
  }

  updateTextContainsImage(text: string) {
    this.textContainsImage = this.formattingService.containsTextAnImage(text);
  }

  toggleFocusMode(focusModeEnabled: boolean) {
    this.roomSettingsService
      .updateFocusModeEnabled(this.editRoom.id, focusModeEnabled)
      .subscribe((settings) => {
        this.focusModeEnabled = settings.focusModeEnabled;
        if (settings.focusModeEnabled) {
          this.focusModeService.updateOverviewState();
        }
      });
  }
}
