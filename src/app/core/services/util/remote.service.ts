import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommentFocusState } from '@app/core/models/events/remote/comment-focus-state';
import { ContentFocusState } from '@app/core/models/events/remote/content-focus-state';
import { FeedbackFocusState } from '@app/core/models/events/remote/feedback-focus-state';
import { UiState } from '@app/core/models/events/remote/ui-state';
@Injectable()
export class RemoteService {
  private updateContentState$: EventEmitter<ContentFocusState> =
    new EventEmitter();
  private updateCommentState$: EventEmitter<CommentFocusState> =
    new EventEmitter();
  private updateFeedbackState$: EventEmitter<FeedbackFocusState> =
    new EventEmitter();
  private uiStateUpdated$: EventEmitter<UiState> = new EventEmitter();

  // Getter and setter for state events

  // CONTENTS
  // Change content state
  updateContentStateChangeWithObject(state: ContentFocusState) {
    this.updateContentState$.emit(state);
  }

  updateContentStateChange(
    contentId: string,
    contentIndex: number,
    contentGroupId: string,
    contentGroupName: string
  ) {
    const contentState = new ContentFocusState(
      contentId,
      contentIndex,
      contentGroupId,
      contentGroupName
    );
    this.updateContentState$.emit(contentState);
  }

  getContentStateChange(): Observable<ContentFocusState> {
    return this.updateContentState$;
  }

  // COMMENTS
  // Update comment state
  updateCommentStateChange(commentId: string) {
    this.updateCommentState$.emit(new CommentFocusState(commentId));
  }

  getCommentStateChange(): Observable<CommentFocusState> {
    return this.updateCommentState$;
  }

  // Feedback
  // Update feedback state
  updateFeedbackStateChange(started: boolean) {
    this.updateFeedbackState$.emit(new FeedbackFocusState(started));
  }

  getFeedbackStateChange(): Observable<FeedbackFocusState> {
    return this.updateFeedbackState$;
  }

  // Content UI State
  updateUiState(state: ContentFocusState) {
    const uiState = new UiState(state.contentId, false, false, false);
    this.uiStateUpdated$.emit(uiState);
  }

  getUiState(): Observable<UiState> {
    return this.uiStateUpdated$;
  }
}
