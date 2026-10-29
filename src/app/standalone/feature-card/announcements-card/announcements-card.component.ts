import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { DisabledIfReadonlyDirective } from '@app/core/directives/disabled-if-readonly.directive';
import { MarkdownFeatureset } from '@app/core/services/http/formatting.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { openAnnouncementDialog } from '@app/standalone/_dialogs/announcement-dialog/announcement-dialog.component';
import { DateComponent } from '@app/standalone/date/date.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import {
  AnnoucentmentsByRoomIdGql,
  AnnoucentmentsByRoomIdQuery,
  DeleteAnnouncementGql,
} from '@gql/generated/graphql';
import { catchError, filter, of, switchMap } from 'rxjs';

type RoomAnnouncement = NonNullable<
  NonNullable<
    NonNullable<AnnoucentmentsByRoomIdQuery['announcementsByRoomId']>['edges']
  >[number]
>['node'];

export const COLLAPSED_COUNT = 1;
export const PAGE_SIZE = 10;

@Component({
  selector: 'app-announcements-card',
  templateUrl: './announcements-card.component.html',
  styleUrls: ['./announcements-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    DateComponent,
    DisabledIfReadonlyDirective,
    LoadingIndicatorComponent,
    MatButton,
    MatCard,
    MatIcon,
    MatIconButton,
    MatTooltip,
    RenderedTextComponent,
    TranslocoPipe,
  ],
})
export class AnnouncementsCardComponent {
  private readonly announcementsByRoomId = inject(AnnoucentmentsByRoomIdGql);
  private readonly deleteAnnouncement = inject(DeleteAnnouncementGql);
  private readonly dialogService = inject(DialogService);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslocoService);

  readonly roomId = input.required<string>();
  readonly canManage = input(false);

  private readonly result = toSignal(
    toObservable(this.roomId).pipe(
      switchMap(
        (roomId) =>
          this.announcementsByRoomId.watch({ variables: { roomId } })
            .valueChanges
      ),
      filter((r) => r.dataState === 'complete'),
      catchError(() => of())
    )
  );
  readonly isLoading = computed(() => this.result()?.loading ?? true);
  private readonly announcements = computed(() =>
    (this.result()?.data?.announcementsByRoomId?.edges ?? [])
      .map((e) => e?.node)
      .filter((n): n is RoomAnnouncement => !!n)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  );
  readonly count = computed(() => this.announcements().length);

  readonly expanded = signal(false);
  /** Grows with each announcement created here, so none of those shown disappear. */
  private readonly visibleCount = signal(COLLAPSED_COUNT);
  readonly shown = computed(() =>
    this.announcements().slice(0, this.visibleCount())
  );
  readonly hasMore = computed(
    () => this.expanded() && this.count() > this.visibleCount()
  );
  readonly hasToggle = computed(
    () => this.expanded() || this.count() > this.visibleCount()
  );

  readonly markdownFeatureset = MarkdownFeatureset.SIMPLE;

  constructor() {
    effect(() => {
      // Nothing is left to expand to, so the toggle would only offer an empty action.
      if (this.expanded() && this.count() <= COLLAPSED_COUNT) {
        this.collapse();
      }
    });
  }

  toggleExpanded() {
    if (!this.expanded()) {
      this.expanded.set(true);
      this.visibleCount.update((visible) => Math.max(visible, PAGE_SIZE));
      return;
    }
    this.collapse();
  }

  showMore() {
    this.visibleCount.update((visible) => visible + PAGE_SIZE);
  }

  create() {
    openAnnouncementDialog(this.dialogService, { roomId: this.roomId() })
      .afterClosed()
      .pipe(filter((savedId): savedId is string => !!savedId))
      .subscribe((savedId) => {
        this.visibleCount.update((visible) => visible + 1);
        afterNextRender(() => this.focus(savedId), { injector: this.injector });
      });
  }

  edit(announcement: RoomAnnouncement) {
    openAnnouncementDialog(this.dialogService, {
      roomId: this.roomId(),
      announcement,
    });
  }

  delete(announcement: RoomAnnouncement) {
    this.dialogService
      .openDeleteDialog(
        'announcement',
        'creator.dialog.really-delete-announcement',
        announcement.title,
        undefined,
        () =>
          this.deleteAnnouncement.mutate({
            variables: { id: announcement.id },
            update: (cache, { data }) => {
              const cacheId =
                data &&
                cache.identify({
                  __typename: 'Announcement',
                  id: data.deleteAnnouncement,
                });
              if (cacheId) {
                cache.evict({ id: cacheId });
                cache.gc();
              }
            },
          })
      )
      .afterClosed()
      .pipe(filter((deleted) => !!deleted))
      .subscribe(() => {
        this.shrinkAfterDelete();
        this.notificationService.showAdvanced(
          this.translateService.translate('creator.announcement.deleted'),
          AdvancedSnackBarTypes.WARNING
        );
      });
  }

  private collapse() {
    this.expanded.set(false);
    this.visibleCount.set(COLLAPSED_COUNT);
  }

  /**
   * Keeps hidden announcements hidden while more than the initial number is shown. At the
   * initial number, the next one moves up as it would on a reload.
   */
  private shrinkAfterDelete() {
    const initial = this.expanded() ? PAGE_SIZE : COLLAPSED_COUNT;
    this.visibleCount.update((visible) => Math.max(initial, visible - 1));
  }

  private focus(id: string) {
    const element = this.elementRef.nativeElement.querySelector<HTMLElement>(
      `[data-focus-id="${id}"]`
    );
    element?.focus();
  }
}
