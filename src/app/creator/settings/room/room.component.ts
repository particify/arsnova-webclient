import {
  AfterViewInit,
  Component,
  effect,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { Router } from '@angular/router';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  FormattingService,
  MarkdownFeatureset,
} from '@app/core/services/http/formatting.service';
import { HintType } from '@app/core/models/hint-type.enum';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { FormComponent } from '@app/standalone/form/form.component';
import { MatTabChangeEvent, MatTabGroup, MatTab } from '@angular/material/tabs';
import { map, switchMap } from 'rxjs';
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
import {
  DeleteRoomGql,
  RoomByShortIdDocument,
  RoomByShortIdGql,
  UpdateRoomDetailsGql,
  UpdateRoomFocusModeGql,
} from '@gql/generated/graphql';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

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
export class RoomComponent extends FormComponent implements AfterViewInit {
  private readonly notificationService = inject(NotificationService);
  private readonly translationService = inject(TranslocoService);
  private readonly router = inject(Router);
  private readonly translateService = inject(TranslocoService);
  private readonly dialogService = inject(DialogService);
  private readonly formattingService = inject(FormattingService);
  private readonly focusModeService = inject(FocusModeService);
  private readonly roomByShortId = inject(RoomByShortIdGql);
  private readonly updateRoomDetails = inject(UpdateRoomDetailsGql);
  private readonly updateRoomFocusModeGql = inject(UpdateRoomFocusModeGql);
  private readonly deleteRoomGql = inject(DeleteRoomGql);

  readonly roomId = input.required<string>();
  readonly shortId = input.required<string>();
  readonly isCreator = input(false);
  readonly markdownFeatureset = MarkdownFeatureset.EXTENDED;
  renderPreview = false;
  textContainsImage = false;
  readonly HintType = HintType;

  private readonly roomResult$ = toObservable(this.shortId).pipe(
    switchMap((shortId) => this.roomByShortId.fetch({ variables: { shortId } }))
  );
  readonly isLoadingOrError = toSignal(
    this.roomResult$.pipe(map((r) => !r.data?.roomByShortId))
  );
  private readonly room = toSignal(
    this.roomResult$.pipe(map((r) => r.data?.roomByShortId))
  );
  readonly name = linkedSignal(() => this.room()?.name ?? '');
  readonly description = linkedSignal(() => this.room()?.description ?? '');
  readonly language = linkedSignal(() => this.room()?.language ?? undefined);
  readonly focusModeEnabled = linkedSignal(
    () => this.room()?.focusModeEnabled ?? false
  );

  constructor() {
    super();
    effect(() => {
      if (!this.isLoadingOrError()) {
        this.enableForm();
      }
    });
  }

  ngAfterViewInit() {
    this.disableForm();
  }

  deleteRoom(): void {
    const dialogRef = this.dialogService.openDeleteDialog(
      'room',
      'dialog.really-delete-room',
      this.room()?.name,
      undefined,
      () => this.deleteRoomGql.mutate({ variables: { id: this.roomId() } })
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.notificationService.showAdvanced(
          this.room()?.name +
            this.translationService.translate('creator.settings.deleted'),
          AdvancedSnackBarTypes.WARNING
        );
        this.router.navigateByUrl('user');
      }
    });
  }

  saveChanges() {
    const name = this.name();
    if (name) {
      this.disableForm();
      this.updateRoomDetails
        .mutate({
          variables: {
            id: this.roomId(),
            name: name,
            description: this.description() ?? '',
            languageCode: this.language(),
          },
          update: (cache) => {
            const room = { ...this.room() };
            if (room) {
              room.name = name;
              room.description = this.description() ?? '';
              room.language = this.language() ?? null;
              cache.writeQuery({
                query: RoomByShortIdDocument,
                variables: { shortId: room.shortId },
                data: {
                  roomByShortId: room,
                },
              });
            }
          },
        })
        .subscribe({
          complete: () => {
            this.enableForm();
            this.notificationService.showAdvanced(
              this.translateService.translate(
                'creator.settings.changes-successful'
              ),
              AdvancedSnackBarTypes.SUCCESS
            );
          },
          error: () => {
            this.notificationService.showAdvanced(
              this.room()?.name +
                this.translationService.translate(
                  'errors.something-went-wrong'
                ),
              AdvancedSnackBarTypes.WARNING
            );
          },
        });
    }
  }

  descriptionTabChanged($event: MatTabChangeEvent) {
    this.renderPreview = $event.index === 1;
  }

  updateTextContainsImage(text: string) {
    this.textContainsImage = this.formattingService.containsTextAnImage(text);
  }

  toggleFocusMode(focusModeEnabled: boolean) {
    this.updateRoomFocusModeGql
      .mutate({
        variables: { id: this.roomId(), enabled: focusModeEnabled },
      })
      .subscribe((result) => {
        if (!result.error && this.focusModeEnabled()) {
          this.focusModeService.updateOverviewState();
        }
      });
  }
}
