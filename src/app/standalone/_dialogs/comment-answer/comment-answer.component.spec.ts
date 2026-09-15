import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import {
  CreateQnaReplyGql,
  DeleteQnaReplyGql,
  ModerationState,
  Post,
  Reply,
  UpdateQnaReplyGql,
} from '@gql/generated/graphql';
import { MockMatDialogRef } from '@testing/test-helpers';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { Observable, of } from 'rxjs';

import { CommentAnswerComponent } from './comment-answer.component';

const POST_ID = 'post-1';
const REPLY_ID = 'reply-1';

/*
 * The generated *Gql services are stubbed structurally: their real signatures pull in Apollo's
 * option and result types, which say nothing about what this component does with them.
 */
type MutationSpy = jasmine.SpyObj<{
  mutate: (options: { variables?: object }) => Observable<unknown>;
}>;

type DialogServiceSpy = jasmine.SpyObj<{
  openDeleteDialog: (
    dialogIdSuffix: string,
    body: string,
    bodyElement?: string,
    confirmLabel?: string,
    confirmAction?: () => Observable<unknown>
  ) => { afterClosed: () => Observable<boolean> };
}>;

describe('CommentAnswerComponent', () => {
  let fixture: ComponentFixture<CommentAnswerComponent>;
  let component: CommentAnswerComponent;
  let createReply: MutationSpy;
  let updateReply: MutationSpy;
  let deleteReply: MutationSpy;
  let dialogService: DialogServiceSpy;

  function reply(body: string): Reply {
    return {
      __typename: 'Reply',
      id: REPLY_ID,
      body: body,
      bodyRendered: `<p>${body}</p>`,
      createdAt: '2026-01-01T00:00:00Z',
    };
  }

  function post(replies: Reply[]): Post {
    return {
      __typename: 'Post',
      id: POST_ID,
      body: 'A question',
      createdAt: '2026-01-01T00:00:00Z',
      moderationState: ModerationState.Accepted,
      replies: replies,
    };
  }

  function mutationSpy(name: string, data: object): MutationSpy {
    const spy: MutationSpy = jasmine.createSpyObj(name, ['mutate']);
    spy.mutate.and.returnValue(of({ data: data }));
    return spy;
  }

  function variablesOf(spy: MutationSpy): object | undefined {
    return spy.mutate.calls.mostRecent().args[0].variables;
  }

  /* In the app it is the confirmation dialog that runs the delete mutation. */
  function confirmDeletion(): void {
    dialogService.openDeleteDialog.calls.mostRecent().args[4]?.();
  }

  function click(testId: string): void {
    const host: HTMLElement = fixture.debugElement.query(
      By.css(`[data-testid="${testId}"]`)
    ).nativeElement;
    /* app-loading-button carries the test id on its host, not on its button. */
    const button: HTMLElement = host.querySelector('button') ?? host;
    button.click();
    fixture.detectChanges();
  }

  function createComponent(replies: Reply[]): void {
    TestBed.overrideProvider(MAT_DIALOG_DATA, {
      useValue: { post: post(replies), isEditor: true },
    });
    fixture = TestBed.createComponent(CommentAnswerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    createReply = mutationSpy('CreateQnaReplyGql', {
      createQnaReply: reply('Created'),
    });
    updateReply = mutationSpy('UpdateQnaReplyGql', {
      updateQnaReply: reply('Updated'),
    });
    deleteReply = mutationSpy('DeleteQnaReplyGql', {
      deleteQnaReply: REPLY_ID,
    });
    dialogService = jasmine.createSpyObj('DialogService', ['openDeleteDialog']);
    dialogService.openDeleteDialog.and.returnValue({
      afterClosed: () => of(true),
    });
    const notificationService = jasmine.createSpyObj('NotificationService', [
      'showAdvanced',
    ]);
    const formattingService = jasmine.createSpyObj('FormattingService', [
      'postString',
      'containsTextAnImage',
    ]);
    formattingService.postString.and.returnValue(of(''));
    configureTestModule(
      [CommentAnswerComponent, getTranslocoModule()],
      [
        { provide: CreateQnaReplyGql, useValue: createReply },
        { provide: UpdateQnaReplyGql, useValue: updateReply },
        { provide: DeleteQnaReplyGql, useValue: deleteReply },
        { provide: DialogService, useValue: dialogService },
        { provide: NotificationService, useValue: notificationService },
        { provide: FormattingService, useValue: formattingService },
        { provide: MatDialogRef, useClass: MockMatDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ]
    );
  });

  it('should delete the reply of the post the dialog was opened for', () => {
    createComponent([reply('Existing')]);
    component.edit = true;
    fixture.detectChanges();

    click('comment-answer-delete-button');
    confirmDeletion();

    expect(deleteReply.mutate).toHaveBeenCalledTimes(1);
    expect(variablesOf(deleteReply)).toEqual({ id: REPLY_ID });
    expect(component.post.replies).toEqual([]);
  });

  it('should update the existing reply instead of creating another one', () => {
    createComponent([reply('Existing')]);
    component.edit = true;
    component.bodyInput = 'Updated';
    fixture.detectChanges();

    click('comment-answer-save-button');

    expect(updateReply.mutate).toHaveBeenCalledTimes(1);
    expect(variablesOf(updateReply)).toEqual({
      id: REPLY_ID,
      body: 'Updated',
    });
    expect(createReply.mutate).not.toHaveBeenCalled();
  });

  it('should create a reply if the post has none', () => {
    createComponent([]);
    component.bodyInput = 'Created';
    fixture.detectChanges();

    click('comment-answer-save-button');

    expect(createReply.mutate).toHaveBeenCalledTimes(1);
    expect(variablesOf(createReply)).toEqual({
      postId: POST_ID,
      body: 'Created',
    });
    expect(updateReply.mutate).not.toHaveBeenCalled();
  });
});
