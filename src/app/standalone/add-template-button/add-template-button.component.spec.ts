import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { RoomSelectionComponent } from '@app/standalone/_dialogs/room-selection/room-selection.component';
import {
  CreateQuestionnaireFromTemplateGql,
  QuestionnairesByRoomIdDocument,
  RoomMembershipsGql,
  RoomRole,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { of, throwError } from 'rxjs';
import { AddTemplateButtonComponent } from './add-template-button.component';

describe('AddTemplateButtonComponent', () => {
  let fixture: ComponentFixture<AddTemplateButtonComponent>;
  let component: AddTemplateButtonComponent;
  let createGql: jasmine.SpyObj<CreateQuestionnaireFromTemplateGql>;
  let membershipsGql: jasmine.SpyObj<RoomMembershipsGql>;
  let dialogOpen: jasmine.Spy;
  let dialogService: jasmine.SpyObj<DialogService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let router: jasmine.SpyObj<Router>;

  const ownRoom = { id: 'room-2', shortId: '22222222' };

  function setUp(rooms: { id: string; shortId: string }[] = []) {
    createGql = jasmine.createSpyObj('CreateQuestionnaireFromTemplateGql', [
      'mutate',
    ]);
    createGql.mutate.and.returnValue(of({ data: {} }) as never);
    membershipsGql = jasmine.createSpyObj('RoomMembershipsGql', ['fetch']);
    membershipsGql.fetch.and.returnValue(
      of({
        data: {
          roomMemberships: { edges: rooms.map((room) => ({ node: { room } })) },
        },
      }) as never
    );
    dialogService = jasmine.createSpyObj('DialogService', [
      'openRoomCreateDialog',
    ]);
    dialogService.openRoomCreateDialog.and.returnValue({
      afterClosed: () => of({ id: 'room-new', shortId: '33333333' }),
    } as never);
    notificationService = jasmine.createSpyObj('NotificationService', [
      'showAdvanced',
    ]);
    router = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.overrideComponent(AddTemplateButtonComponent, {
      set: { template: '' },
    });
    configureTestModule(
      [getTranslocoModule(), AddTemplateButtonComponent],
      [
        { provide: CreateQuestionnaireFromTemplateGql, useValue: createGql },
        { provide: RoomMembershipsGql, useValue: membershipsGql },
        { provide: DialogService, useValue: dialogService },
        { provide: NotificationService, useValue: notificationService },
        { provide: Router, useValue: router },
      ]
    ).compileComponents();
    fixture = TestBed.createComponent(AddTemplateButtonComponent);
    component = fixture.componentInstance;
    // The component's own imports provide the dialog service it injects.
    dialogOpen = spyOn(
      fixture.debugElement.injector.get(MatDialog),
      'open'
    ).and.returnValue({ afterClosed: () => of(ownRoom) } as never);
    fixture.componentRef.setInput('templateId', 't-1');
    fixture.componentRef.setInput('templateName', 'Template');
    fixture.detectChanges();
  }

  function createdIn(): string | undefined {
    return createGql.mutate.calls.mostRecent()?.args[0]?.variables?.input
      .roomId;
  }

  it('adds the template to the current room and opens it', () => {
    setUp();
    fixture.componentRef.setInput('roomId', 'room-1');
    fixture.componentRef.setInput('shortId', '11111111');
    component.useTemplate();
    expect(membershipsGql.fetch).not.toHaveBeenCalled();
    expect(createGql.mutate).toHaveBeenCalledOnceWith({
      variables: { input: { roomId: 'room-1', templateId: 't-1' } },
      refetchQueries: [QuestionnairesByRoomIdDocument],
    });
    expect(notificationService.showAdvanced).toHaveBeenCalledOnceWith(
      'templates.template-added',
      AdvancedSnackBarTypes.SUCCESS
    );
    expect(router.navigate).toHaveBeenCalledOnceWith(['edit', '11111111']);
  });

  it('lets the user pick one of their own rooms', () => {
    setUp([ownRoom]);
    component.useTemplate();
    expect(membershipsGql.fetch).toHaveBeenCalledOnceWith({
      variables: { query: { anyRole: [RoomRole.Owner] } },
      fetchPolicy: 'no-cache',
    });
    expect(dialogOpen).toHaveBeenCalledOnceWith(
      RoomSelectionComponent,
      jasmine.objectContaining({ data: { rooms: [ownRoom] } })
    );
    expect(createdIn()).toBe('room-2');
    expect(router.navigate).toHaveBeenCalledOnceWith(['edit', '22222222']);
  });

  it('adds nothing when the room selection is dismissed', () => {
    setUp([ownRoom]);
    dialogOpen.and.returnValue({ afterClosed: () => of(undefined) } as never);
    component.useTemplate();
    expect(createGql.mutate).not.toHaveBeenCalled();
  });

  it('offers to create a room for a user without one', () => {
    setUp([]);
    component.useTemplate();
    expect(dialogService.openRoomCreateDialog).toHaveBeenCalledOnceWith(
      'Template',
      undefined,
      false
    );
    expect(createdIn()).toBe('room-new');
    // Creating the room has already been confirmed.
    expect(notificationService.showAdvanced).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledOnceWith(['edit', '33333333']);
  });

  it('stays on the template when adding it fails', () => {
    setUp();
    createGql.mutate.and.returnValue(throwError(() => new Error('nope')));
    fixture.componentRef.setInput('roomId', 'room-1');
    fixture.componentRef.setInput('shortId', '11111111');
    component.useTemplate();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.formDisabled).toBeFalse();
  });
});
