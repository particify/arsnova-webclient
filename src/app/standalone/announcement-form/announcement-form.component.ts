import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { Dir } from '@angular/cdk/bidi';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { FlexModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatTab, MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { MarkdownFeatureset } from '@app/core/services/http/formatting.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { FormComponent } from '@app/standalone/form/form.component';
import { FormattingToolbarComponent } from '@app/standalone/formatting-toolbar/formatting-toolbar.component';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import {
  AnnoucentmentsByRoomIdDocument,
  CreateAnnouncementGql,
  UpdateAnnouncementGql,
} from '@gql/generated/graphql';
import { Observable, map } from 'rxjs';

export interface EditableAnnouncement {
  body: string;
  id: string;
  title: string;
}

@Component({
  selector: 'app-announcement-form',
  templateUrl: './announcement-form.component.html',
  styleUrls: ['./announcement-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    CdkTextareaAutosize,
    Dir,
    FlexModule,
    FormattingToolbarComponent,
    FormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatTab,
    MatTabGroup,
    RenderedTextComponent,
    TranslocoPipe,
  ],
})
export class AnnouncementFormComponent extends FormComponent implements OnInit {
  private readonly createAnnouncement = inject(CreateAnnouncementGql);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslocoService);
  private readonly updateAnnouncement = inject(UpdateAnnouncementGql);

  readonly roomId = input.required<string>();
  /** Edits this announcement instead of creating a new one. */
  readonly announcement = input<EditableAnnouncement>();
  /** Emits the ID of the saved announcement. */
  readonly saved = output<string>();

  readonly titleInput =
    viewChild.required<ElementRef<HTMLInputElement>>('titleInput');

  title = '';
  body = '';
  editId?: string;
  renderPreview = false;
  readonly markdownFeatureset = MarkdownFeatureset.SIMPLE;

  constructor() {
    super();
    afterNextRender(() => this.titleInput().nativeElement.focus());
  }

  ngOnInit(): void {
    const announcement = this.announcement();
    if (announcement) {
      this.editId = announcement.id;
      this.title = announcement.title;
      this.body = announcement.body;
    }
  }

  hasChanges(): boolean {
    const announcement = this.announcement();
    return (
      this.title !== (announcement?.title ?? '') ||
      this.body !== (announcement?.body ?? '')
    );
  }

  tabChanged(event: MatTabChangeEvent) {
    this.renderPreview = event.index === 1;
  }

  save() {
    if (!this.title || !this.body) {
      this.notify('creator.announcement.missing-input', false);
      return;
    }
    this.disableForm();
    const editId = this.editId;
    const result$: Observable<{ id?: string; error?: unknown }> = editId
      ? this.updateAnnouncement
          .mutate({
            variables: { id: editId, title: this.title, body: this.body },
          })
          .pipe(
            map((r) => ({ id: r.data?.updateAnnouncement?.id, error: r.error }))
          )
      : this.createAnnouncement
          .mutate({
            variables: {
              roomId: this.roomId(),
              title: this.title,
              body: this.body,
            },
            refetchQueries: [AnnoucentmentsByRoomIdDocument],
            awaitRefetchQueries: true,
          })
          .pipe(
            map((r) => ({ id: r.data?.createAnnouncement?.id, error: r.error }))
          );
    const successKey = editId
      ? 'creator.announcement.changes-saved'
      : 'creator.announcement.published';
    result$.subscribe(({ id, error }) => {
      if (id) {
        this.notify(successKey, true);
        this.saved.emit(id);
      }
      if (id || error) {
        this.enableForm();
      }
    });
  }

  private notify(key: string, success: boolean) {
    this.notificationService.showAdvanced(
      this.translateService.translate(key),
      success ? AdvancedSnackBarTypes.SUCCESS : AdvancedSnackBarTypes.WARNING
    );
  }
}
