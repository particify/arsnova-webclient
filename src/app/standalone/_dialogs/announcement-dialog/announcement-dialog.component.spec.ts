import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import {
  CreateAnnouncementGql,
  UpdateAnnouncementGql,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { NEVER, of, Subject } from 'rxjs';
import {
  AnnouncementDialogComponent,
  AnnouncementDialogData,
} from './announcement-dialog.component';

describe('AnnouncementDialogComponent', () => {
  let fixture: ComponentFixture<AnnouncementDialogComponent>;
  let component: AnnouncementDialogComponent;
  let dialogRef: jasmine.SpyObj<MatDialogRef<AnnouncementDialogComponent>>;
  let dialogService: jasmine.SpyObj<DialogService>;
  let backdropClick$: Subject<MouseEvent>;
  let keydown$: Subject<KeyboardEvent>;

  const existing = { id: 'a-1', title: 'Title', body: 'Body' };

  function setUp(data: AnnouncementDialogData) {
    backdropClick$ = new Subject();
    keydown$ = new Subject();
    dialogRef = jasmine.createSpyObj('MatDialogRef', [
      'backdropClick',
      'close',
      'keydownEvents',
    ]);
    dialogRef.backdropClick.and.returnValue(backdropClick$);
    dialogRef.keydownEvents.and.returnValue(keydown$);
    dialogService = jasmine.createSpyObj('DialogService', ['openDeleteDialog']);
    const updateGql = jasmine.createSpyObj('UpdateAnnouncementGql', ['mutate']);
    updateGql.mutate.and.returnValue(
      of({ data: { updateAnnouncement: { id: 'a-1' } } }) as never
    );
    configureTestModule(
      [getTranslocoModule(), AnnouncementDialogComponent],
      [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: DialogService, useValue: dialogService },
        {
          provide: CreateAnnouncementGql,
          useValue: jasmine.createSpyObj('CreateAnnouncementGql', ['mutate']),
        },
        { provide: UpdateAnnouncementGql, useValue: updateGql },
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
    fixture = TestBed.createComponent(AnnouncementDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function confirmDiscarding(discard: boolean) {
    dialogService.openDeleteDialog.and.returnValue({
      afterClosed: () => of(discard),
    } as never);
  }

  function text(): string {
    return fixture.nativeElement.textContent;
  }

  it('names title and submit action after creating', () => {
    setUp({ roomId: 'room-1' });

    expect(text()).toContain('creator.announcement.create-announcement');
    expect(text()).toContain('creator.announcement.publish');
    expect(component.form().announcement()).toBeUndefined();
  });

  it('names title and submit action after editing', () => {
    setUp({ roomId: 'room-1', announcement: existing });

    expect(text()).toContain('creator.announcement.edit-announcement');
    expect(text()).toContain('creator.announcement.save');
    expect(component.form().announcement()).toBe(existing);
  });

  it('closes with the ID of the saved announcement', () => {
    setUp({ roomId: 'room-1', announcement: existing });
    component.form().body = 'Changed';

    component.save();

    expect(dialogRef.close).toHaveBeenCalledOnceWith('a-1');
  });

  it('closes right away without changes', () => {
    setUp({ roomId: 'room-1', announcement: existing });

    component.cancel();

    expect(dialogService.openDeleteDialog).not.toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledOnceWith(undefined);
  });

  it('asks before discarding changes and stays open if declined', () => {
    setUp({ roomId: 'room-1', announcement: existing });
    confirmDiscarding(false);
    component.form().title = 'Changed';

    component.cancel();

    expect(dialogService.openDeleteDialog).toHaveBeenCalledOnceWith(
      'announcement',
      'creator.dialog.really-discard-announcement',
      undefined,
      'creator.dialog.discard'
    );
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('closes once changes are discarded', () => {
    setUp({ roomId: 'room-1' });
    confirmDiscarding(true);
    component.form().title = 'Draft';

    component.cancel();

    expect(dialogRef.close).toHaveBeenCalledOnceWith(undefined);
  });

  it('asks before discarding on Escape and on the backdrop', () => {
    setUp({ roomId: 'room-1' });
    confirmDiscarding(false);
    component.form().title = 'Draft';

    keydown$.next(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(dialogService.openDeleteDialog).not.toHaveBeenCalled();
    keydown$.next(new KeyboardEvent('keydown', { key: 'Escape' }));
    backdropClick$.next(new MouseEvent('click'));

    expect(dialogService.openDeleteDialog).toHaveBeenCalledTimes(2);
    expect(dialogRef.close).not.toHaveBeenCalled();
  });
});
