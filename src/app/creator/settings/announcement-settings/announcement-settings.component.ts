import {
  Component,
  ElementRef,
  computed,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { MarkdownFeatureset } from '@app/core/services/http/formatting.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { MatTabChangeEvent, MatTabGroup, MatTab } from '@angular/material/tabs';
import { DialogService } from '@app/core/services/util/dialog.service';
import { UserRole } from '@app/core/models/user-roles.enum';
import { FormComponent } from '@app/standalone/form/form.component';
import { FlexModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormattingToolbarComponent } from '@app/standalone/formatting-toolbar/formatting-toolbar.component';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Dir } from '@angular/cdk/bidi';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { MatButton } from '@angular/material/button';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { AnnouncementComponent } from '@app/standalone/announcement/announcement.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import {
  AnnoucentmentsByRoomIdGql,
  CreateAnnouncementGql,
  DeleteAnnouncementGql,
  Exact,
  UpdateAnnouncementGql,
} from '@gql/generated/graphql';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, filter, of, switchMap } from 'rxjs';
import { QueryRef } from 'apollo-angular';

@Component({
  selector: 'app-announcement-settings',
  templateUrl: './announcement-settings.component.html',
  styleUrls: ['./announcement-settings.component.scss'],
  imports: [
    FlexModule,
    FormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatTabGroup,
    MatTab,
    FormattingToolbarComponent,
    CdkTextareaAutosize,
    Dir,
    RenderedTextComponent,
    MatButton,
    LoadingButtonComponent,
    AnnouncementComponent,
    LoadingIndicatorComponent,
    TranslocoPipe,
  ],
})
export class AnnouncementSettingsComponent extends FormComponent {
  private translateService = inject(TranslocoService);
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);
  private announcementsByRoomId = inject(AnnoucentmentsByRoomIdGql);
  private createAnnouncement = inject(CreateAnnouncementGql);
  private deleteAnnouncement = inject(DeleteAnnouncementGql);
  private updateAnnouncement = inject(UpdateAnnouncementGql);
  roomId = input.required<string>();

  private announcementsQueryRef?: QueryRef<any, Exact<{ roomId: string }>>;
  private announcementResult = toSignal(
    toObservable(this.roomId).pipe(
      switchMap((roomId) => {
        const ref = this.announcementsByRoomId.watch({ variables: { roomId } });
        this.announcementsQueryRef = ref;
        return ref.valueChanges;
      }),
      filter((r) => r.dataState === 'complete'),
      catchError(() => of())
    )
  );

  isLoading = computed(() => this.announcementResult()?.loading ?? true);

  announcements = computed(() =>
    this.announcementResult()
      ?.data?.announcementsByRoomId?.edges?.map((e) => e?.node)
      .filter((n) => !!n)
      .sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      })
  );

  inputTabs = viewChild.required<MatTabGroup>('inputTabs');
  titleInput = viewChild.required<ElementRef>('titleInput');

  title = '';
  body = '';

  editId?: string;
  renderPreview = false;
  markdownFeatureset = MarkdownFeatureset.SIMPLE;

  UserRole = UserRole;

  delete(id: string) {
    const announcement = this.announcements()?.find((a) => a.id === id);
    if (!announcement) {
      return;
    }
    const dialogRef = this.dialogService.openDeleteDialog(
      'announcement',
      'creator.dialog.really-delete-announcement',
      announcement.title,
      undefined,
      () =>
        this.deleteAnnouncement.mutate({
          variables: { id: announcement.id },
          update: (cache, { data }) => {
            if (data) {
              const cacheId = cache.identify({
                __typename: 'Announcement',
                id: data.deleteAnnouncement,
              });
              if (cacheId) {
                cache.evict({ id: cacheId });
                cache.gc();
              }
            }
          },
        })
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const msg = this.translateService.translate(
          'creator.announcement.deleted'
        );

        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );
      }
    });
  }

  tabChanged(event: MatTabChangeEvent) {
    this.renderPreview = event.index === 1;
  }

  save() {
    if (!this.title || !this.body) {
      const msg = this.translateService.translate(
        'creator.announcement.missing-input'
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      return;
    }
    this.disableForm();
    if (this.editId) {
      this.updateAnnouncement
        .mutate({
          variables: { id: this.editId, title: this.title, body: this.body },
        })
        .subscribe((r) => {
          if (r.data) {
            this.announcementsQueryRef?.refetch();
            const msg = this.translateService.translate(
              'creator.announcement.changes-saved'
            );
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.SUCCESS
            );
            this.reset();
            this.enableForm();
          }
          if (r.error) {
            this.enableForm();
          }
        });
    } else {
      this.createAnnouncement
        .mutate({
          variables: {
            roomId: this.roomId(),
            title: this.title,
            body: this.body,
          },
        })
        .subscribe((r) => {
          if (r.data) {
            this.announcementsQueryRef?.refetch();
            const msg = this.translateService.translate(
              'creator.announcement.created'
            );
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.SUCCESS
            );
            this.reset();
            this.enableForm();
          }
          if (r.error) {
            this.enableForm();
          }
        });
    }
  }

  edit(id: string) {
    const announcement = this.announcements()?.find((a) => a.id === id);
    if (!announcement) {
      return;
    }
    if (!this.title && !this.body) {
      this.editId = announcement.id;
      this.title = announcement.title;
      this.body = announcement.body;
      this.titleInput().nativeElement.focus();
    } else {
      const dialogRef = this.dialogService.openDeleteDialog(
        'announcement',
        'creator.dialog.really-discard-announcement',
        undefined,
        'creator.dialog.discard'
      );
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.resetInputs();
          this.edit(announcement.id);
        }
      });
    }
  }

  reset() {
    this.editId = undefined;
    this.inputTabs().selectedIndex = 0;
    this.renderPreview = false;
    this.resetInputs();
  }

  resetInputs() {
    this.title = '';
    this.body = '';
  }
}
