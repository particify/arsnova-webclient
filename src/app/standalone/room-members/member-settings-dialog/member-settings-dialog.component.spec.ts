import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { MemberListComponent } from '@app/standalone/room-members/member-list/member-list.component';
import { member } from '@app/standalone/room-members/member-list/member-list.component.spec';
import { RoomMembersService } from '@app/standalone/room-members/room-members.service';
import { MemberInviteFormComponent } from '@app/standalone/room-members/member-invite-form/member-invite-form.component';
import { RoomRole } from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { of } from 'rxjs';
import { MemberSettingsDialogComponent } from './member-settings-dialog.component';

describe('MemberSettingsDialogComponent', () => {
  let fixture: ComponentFixture<MemberSettingsDialogComponent>;

  beforeEach(() => {
    const roomMembersService = jasmine.createSpyObj('RoomMembersService', [
      'watchMembers',
    ]);
    roomMembersService.watchMembers.and.returnValue(
      of([
        member('owner@example.com', RoomRole.Owner),
        member('tutor@example.com', RoomRole.Moderator),
        member('assistant@example.com', RoomRole.Moderator),
      ])
    );
    // The invite form has its own spec.
    TestBed.overrideComponent(MemberSettingsDialogComponent, {
      remove: { imports: [MemberInviteFormComponent] },
      add: { schemas: [NO_ERRORS_SCHEMA] },
    });
    configureTestModule(
      [getTranslocoModule(), MemberSettingsDialogComponent],
      [
        { provide: MAT_DIALOG_DATA, useValue: { roomId: 'room-1' } },
        { provide: RoomMembersService, useValue: roomMembersService },
      ]
    ).compileComponents();
    fixture = TestBed.createComponent(MemberSettingsDialogComponent);
    fixture.detectChanges();
  });

  function list(): MemberListComponent {
    return fixture.debugElement.query(By.directive(MemberListComponent))
      .componentInstance;
  }

  it('lists every member without a limit or a filter', () => {
    expect(list().limit()).toBeUndefined();
    expect(list().shownMembers()?.length).toBe(3);
  });

  it('moves the focus to the invite field once nobody is left to remove', () => {
    const field = document.createElement('input');
    field.setAttribute('data-testid', 'team-login-id');
    fixture.nativeElement.appendChild(field);

    list().lastRemoved.emit();

    expect(document.activeElement).toBe(field);
  });

  it('names its close button for assistive technology', () => {
    const close: HTMLButtonElement =
      fixture.nativeElement.querySelector('[mat-dialog-close]');

    expect(close.getAttribute('aria-label')).toBe('dialog.close');
  });
});
