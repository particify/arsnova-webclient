import { ApplicationRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { DateComponent } from '@app/standalone/date/date.component';
import { AnnouncementDialogComponent } from '@app/standalone/_dialogs/announcement-dialog/announcement-dialog.component';
import {
  AnnoucentmentsByRoomIdGql,
  DeleteAnnouncementGql,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { BehaviorSubject, NEVER, Observable, of } from 'rxjs';
import { AnnouncementsCardComponent } from './announcements-card.component';

describe('AnnouncementsCardComponent', () => {
  let fixture: ComponentFixture<AnnouncementsCardComponent>;
  let component: AnnouncementsCardComponent;
  let dialogService: jasmine.SpyObj<DialogService>;
  let result$: BehaviorSubject<ReturnType<typeof resultOf>>;

  /** Announcement n was created on day n, so higher numbers are newer. */
  function announcements(count: number) {
    return Array.from({ length: count }, (_, i) => ({
      id: `a-${i + 1}`,
      title: `Title ${i + 1}`,
      body: 'Body',
      bodyRendered: '<p>Body</p>',
      createdAt: new Date(Date.UTC(2026, 0, i + 1)).toISOString(),
      updatedAt: null as string | null,
    }));
  }

  function resultOf(nodes: ReturnType<typeof announcements>) {
    return {
      dataState: 'complete',
      loading: false,
      data: {
        announcementsByRoomId: { edges: nodes.map((node) => ({ node })) },
      },
    };
  }

  function setUp(nodes = announcements(3), canManage = true) {
    const announcementsByRoomId = jasmine.createSpyObj(
      'AnnoucentmentsByRoomIdGql',
      ['watch']
    );
    result$ = new BehaviorSubject(resultOf(nodes));
    announcementsByRoomId.watch.and.returnValue({ valueChanges: result$ });
    dialogService = jasmine.createSpyObj('DialogService', [
      'openDeleteDialog',
      'openDialog',
    ]);
    dialogService.openDeleteDialog.and.returnValue({
      afterClosed: () => of(true),
    } as never);
    closeDialogWith(NEVER);
    configureTestModule(
      [getTranslocoModule(), AnnouncementsCardComponent],
      [
        {
          provide: AnnoucentmentsByRoomIdGql,
          useValue: announcementsByRoomId,
        },
        { provide: DeleteAnnouncementGql, useValue: {} },
        { provide: DialogService, useValue: dialogService },
        {
          provide: FormattingService,
          useValue: jasmine.createSpyObj('FormattingService', {
            postString: NEVER,
          }),
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', [
            'showAdvanced',
          ]),
        },
      ]
    ).compileComponents();
    fixture = TestBed.createComponent(AnnouncementsCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('roomId', 'room-1');
    fixture.componentRef.setInput('canManage', canManage);
    fixture.detectChanges();
  }

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function byTestId(id: string): HTMLElement | null {
    return query(`[data-testid="${id}"]`);
  }

  function shownTitles(): (string | undefined)[] {
    return [
      ...fixture.nativeElement.querySelectorAll(
        '[data-testid="announcement-item"] .item-title'
      ),
    ].map((t: HTMLElement) => t.textContent?.trim());
  }

  /** Makes the announcement dialog close with what `afterClosed$` emits. */
  function closeDialogWith(afterClosed$: Observable<string | undefined>) {
    dialogService.openDialog.and.returnValue({
      afterClosed: () => afterClosed$,
    } as never);
  }

  function openedDialogData() {
    expect(dialogService.openDialog).toHaveBeenCalledOnceWith(
      AnnouncementDialogComponent,
      jasmine.objectContaining({ disableClose: true })
    );
    return dialogService.openDialog.calls.mostRecent().args[1]?.data;
  }

  function click(id: string) {
    byTestId(id)?.click();
    fixture.detectChanges();
  }

  function render() {
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
  }

  describe('collapsed', () => {
    it('shows the latest announcement in full', () => {
      setUp();

      expect(shownTitles()).toEqual(['Title 3']);
      expect(query('.item .item-body app-rendered-text')).not.toBeNull();
      expect(query('.item app-date')).not.toBeNull();
    });

    it('marks an edited announcement, keeping its creation date', () => {
      const nodes = announcements(1);
      setUp(nodes);
      expect(query('.item .meta .edited')).toBeNull();

      result$.next(
        resultOf([{ ...nodes[0], updatedAt: '2026-02-01T00:00:00.000Z' }])
      );
      fixture.detectChanges();

      expect(query('.item .meta .edited')?.textContent).toContain(
        'announcement.edited'
      );
      const date = fixture.debugElement.query(By.directive(DateComponent));
      expect(date.componentInstance.timestamp()).toEqual(
        new Date(nodes[0].createdAt)
      );
    });

    it('offers to show all of them', () => {
      setUp();

      const toggle = byTestId('toggle-announcements');
      expect(toggle?.textContent).toContain('creator.announcement.show-all');
      expect(toggle?.getAttribute('aria-expanded')).toBe('false');
      expect(component.count()).toBe(3);
    });

    it('needs no toggle for a single announcement', () => {
      setUp(announcements(1));

      expect(byTestId('toggle-announcements')).toBeNull();
    });

    it('shows a hint if there are no announcements', () => {
      setUp([]);

      expect(query('.empty-hint')?.textContent).toContain(
        'announcement.no-announcements'
      );
      expect(byTestId('create-announcement')).not.toBeNull();
    });
  });

  describe('expanded', () => {
    it('lists all announcements', () => {
      setUp();

      click('toggle-announcements');

      expect(shownTitles()).toEqual(['Title 3', 'Title 2', 'Title 1']);
      const toggle = byTestId('toggle-announcements');
      expect(toggle?.getAttribute('aria-expanded')).toBe('true');
      expect(toggle?.textContent).toContain('creator.announcement.show-less');
    });

    it('keeps the focus on the toggle', () => {
      setUp();
      const toggle = byTestId('toggle-announcements');
      toggle?.focus();

      click('toggle-announcements');

      expect(document.activeElement).toBe(toggle);
    });

    it('shows ten more at a time', () => {
      setUp(announcements(25));

      click('toggle-announcements');
      expect(shownTitles().length).toBe(10);
      expect(shownTitles()[0]).toBe('Title 25');

      click('show-more-announcements');
      expect(shownTitles().length).toBe(20);

      click('show-more-announcements');
      expect(shownTitles().length).toBe(25);
      expect(byTestId('show-more-announcements')).toBeNull();
    });

    it('collapses again', () => {
      setUp(announcements(25));
      click('toggle-announcements');
      click('show-more-announcements');

      click('toggle-announcements');

      expect(shownTitles().length).toBe(1);
      click('toggle-announcements');
      expect(shownTitles().length).toBe(10);
    });
  });

  describe('managing', () => {
    it('offers edit and delete per announcement, revealed on hover or focus', () => {
      setUp();

      const actions = query('.item .hover-actions');
      expect(actions).not.toBeNull();
      expect(
        actions?.querySelector('[data-testid="edit-announcement"]')
      ).not.toBeNull();
      const hidden = !matchMedia('(hover: none)').matches;
      expect(getComputedStyle(actions as Element).opacity).toBe(
        hidden ? '0' : '1'
      );
      (
        actions?.querySelector(
          '[data-testid="edit-announcement"]'
        ) as HTMLElement
      ).focus();
      expect(getComputedStyle(actions as Element).opacity).toBe('1');
    });

    it('labels the entry action as creating an announcement', () => {
      setUp();

      const create = byTestId('create-announcement');
      expect(create?.textContent).toContain('creator.announcement.create');
      expect(create?.getAttribute('aria-label')).toBe(
        'creator.announcement.a11y-create'
      );
    });

    it('names the announcement in the action labels', () => {
      setUp();

      expect(
        byTestId('edit-announcement')?.getAttribute('aria-label')
      ).toContain('creator.announcement.a11y-edit');
    });

    it('edits an announcement in a dialog', () => {
      setUp();

      click('edit-announcement');

      expect(openedDialogData()).toEqual({
        roomId: 'room-1',
        announcement: jasmine.objectContaining({ id: 'a-3', title: 'Title 3' }),
      });
      expect(shownTitles()).toEqual(['Title 3']);
    });

    it('creates an announcement in a dialog', () => {
      setUp();

      click('create-announcement');

      expect(openedDialogData()).toEqual({ roomId: 'room-1' });
      expect(component.expanded()).toBeFalse();
      expect(byTestId('create-announcement')).not.toBeNull();
    });

    it('focuses a created announcement', () => {
      setUp();
      closeDialogWith(of('a-4'));
      result$.next(resultOf(announcements(4)));

      click('create-announcement');
      render();

      expect(document.activeElement?.getAttribute('data-focus-id')).toBe('a-4');
    });

    it('leaves the list alone when a draft is cancelled', () => {
      setUp();
      closeDialogWith(of(undefined));
      result$.next(resultOf(announcements(4)));

      click('create-announcement');
      render();

      expect(shownTitles()).toEqual(['Title 4']);
    });

    it('collapses without asking anything', () => {
      setUp();
      click('toggle-announcements');

      click('toggle-announcements');

      expect(component.expanded()).toBeFalse();
      expect(dialogService.openDeleteDialog).not.toHaveBeenCalled();
    });

    it('collapses by itself once there is nothing more to show', () => {
      setUp();
      click('toggle-announcements');

      result$.next(resultOf(announcements(1)));
      fixture.detectChanges();

      expect(component.expanded()).toBeFalse();
      expect(byTestId('toggle-announcements')).toBeNull();
      result$.next(resultOf(announcements(3)));
      fixture.detectChanges();
      expect(component.expanded()).toBeFalse();
    });

    function createAnnouncement(total: number) {
      result$.next(resultOf(announcements(total)));
      closeDialogWith(of(`a-${total}`));
      click('create-announcement');
    }

    function deleteAnnouncement(
      title: string,
      remaining: ReturnType<typeof announcements>
    ) {
      const item = [
        ...fixture.nativeElement.querySelectorAll(
          '[data-testid="announcement-item"]'
        ),
      ].find((i: HTMLElement) => i.textContent?.includes(title));
      item.querySelector('[data-testid="delete-announcement"]').click();
      result$.next(resultOf(remaining));
      fixture.detectChanges();
    }

    it('keeps showing the announcements and adds created ones on top', () => {
      setUp();

      createAnnouncement(4);
      expect(shownTitles()).toEqual(['Title 4', 'Title 3']);
      createAnnouncement(5);
      expect(shownTitles()).toEqual(['Title 5', 'Title 4', 'Title 3']);
      expect(component.expanded()).toBeFalse();
      expect(byTestId('toggle-announcements')?.textContent).toContain(
        'creator.announcement.show-all'
      );
    });

    it('offers to show all only while some are hidden', () => {
      setUp(announcements(1));

      createAnnouncement(2);

      expect(shownTitles().length).toBe(2);
      expect(byTestId('toggle-announcements')).toBeNull();
    });

    it('shows the latest only again once collapsed', () => {
      setUp();
      createAnnouncement(4);
      click('toggle-announcements');
      expect(shownTitles().length).toBe(4);

      click('toggle-announcements');

      expect(shownTitles()).toEqual(['Title 4']);
    });

    it('does not reveal a hidden announcement when deleting an added one', () => {
      setUp();
      createAnnouncement(4);

      deleteAnnouncement('Title 4', announcements(3));

      expect(shownTitles()).toEqual(['Title 3']);
    });

    it('still shows the latest after deleting it', () => {
      setUp(announcements(4));

      deleteAnnouncement('Title 4', announcements(3));

      expect(shownTitles()).toEqual(['Title 3']);
    });

    it('confirms before deleting', () => {
      setUp();

      click('delete-announcement');

      expect(dialogService.openDeleteDialog).toHaveBeenCalledOnceWith(
        'announcement',
        'creator.dialog.really-delete-announcement',
        'Title 3',
        undefined,
        jasmine.any(Function)
      );
    });
  });

  it('is read-only for moderators, who can still expand it', () => {
    setUp(announcements(3), false);

    expect(byTestId('create-announcement')).toBeNull();
    expect(query('.hover-actions')).toBeNull();
    click('toggle-announcements');
    expect(shownTitles().length).toBe(3);
  });
});
