import { ApplicationRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormattingService } from '@app/core/services/http/formatting.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import {
  AnnoucentmentsByRoomIdDocument,
  CreateAnnouncementGql,
  UpdateAnnouncementGql,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { NEVER, of } from 'rxjs';
import {
  AnnouncementFormComponent,
  EditableAnnouncement,
} from './announcement-form.component';

describe('AnnouncementFormComponent', () => {
  let fixture: ComponentFixture<AnnouncementFormComponent>;
  let component: AnnouncementFormComponent;
  let createGql: jasmine.SpyObj<CreateAnnouncementGql>;
  let updateGql: jasmine.SpyObj<UpdateAnnouncementGql>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let saved: jasmine.Spy;

  const existing: EditableAnnouncement = {
    id: 'a-1',
    title: 'Title',
    body: 'Body',
  };

  function setUp(announcement?: EditableAnnouncement) {
    createGql = jasmine.createSpyObj('CreateAnnouncementGql', ['mutate']);
    createGql.mutate.and.returnValue(
      of({ data: { createAnnouncement: { id: 'a-new' } } }) as never
    );
    updateGql = jasmine.createSpyObj('UpdateAnnouncementGql', ['mutate']);
    updateGql.mutate.and.returnValue(
      of({ data: { updateAnnouncement: { id: 'a-1' } } }) as never
    );
    notificationService = jasmine.createSpyObj('NotificationService', [
      'showAdvanced',
    ]);
    configureTestModule(
      [getTranslocoModule(), AnnouncementFormComponent],
      [
        { provide: CreateAnnouncementGql, useValue: createGql },
        { provide: UpdateAnnouncementGql, useValue: updateGql },
        {
          provide: FormattingService,
          useValue: jasmine.createSpyObj('FormattingService', {
            postString: NEVER,
          }),
        },
        { provide: NotificationService, useValue: notificationService },
      ]
    ).compileComponents();
    fixture = TestBed.createComponent(AnnouncementFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('roomId', 'room-1');
    fixture.componentRef.setInput('announcement', announcement);
    saved = jasmine.createSpy('saved');
    component.saved.subscribe(saved);
    fixture.detectChanges();
  }

  it('creates an announcement in the room and refreshes its list', () => {
    setUp();
    component.title = 'New';
    component.body = 'Text';

    component.save();

    expect(createGql.mutate).toHaveBeenCalledOnceWith({
      variables: { roomId: 'room-1', title: 'New', body: 'Text' },
      refetchQueries: [AnnoucentmentsByRoomIdDocument],
      awaitRefetchQueries: true,
    });
    expect(notificationService.showAdvanced).toHaveBeenCalledOnceWith(
      'creator.announcement.published',
      AdvancedSnackBarTypes.SUCCESS
    );
    expect(saved).toHaveBeenCalledOnceWith('a-new');
  });

  it('edits a given announcement and saves changes to it', () => {
    setUp(existing);
    expect(component.title).toBe('Title');
    component.body = 'Changed';

    component.save();

    expect(updateGql.mutate).toHaveBeenCalledOnceWith({
      variables: { id: 'a-1', title: 'Title', body: 'Changed' },
    });
    expect(createGql.mutate).not.toHaveBeenCalled();
    expect(saved).toHaveBeenCalledOnceWith('a-1');
  });

  it('asks for title and body before saving', () => {
    setUp();
    component.title = 'Only a title';

    component.save();

    expect(createGql.mutate).not.toHaveBeenCalled();
    expect(notificationService.showAdvanced).toHaveBeenCalledOnceWith(
      'creator.announcement.missing-input',
      AdvancedSnackBarTypes.WARNING
    );
  });

  it('tells whether the input differs from the announcement', () => {
    setUp(existing);
    expect(component.hasChanges()).toBeFalse();

    component.body = 'Changed';

    expect(component.hasChanges()).toBeTrue();
  });

  it('focuses the title field', () => {
    setUp(existing);
    TestBed.inject(ApplicationRef).tick();

    expect(document.activeElement).toBe(
      fixture.nativeElement.querySelector('input[name="title"]')
    );
  });
});
