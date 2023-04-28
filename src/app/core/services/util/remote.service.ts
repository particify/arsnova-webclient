import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommentFocusState } from '@app/core/models/events/remote/comment-focus-state';
import { ContentFocusState } from '@app/core/models/events/remote/content-focus-state';
import { FeedbackFocusState } from '@app/core/models/events/remote/feedback-focus-state';
import { UiState } from '@app/core/models/events/remote/ui-state';
@Injectable()
export class RemoteService {
  isGuided = false;

  private updateContentState$: EventEmitter<ContentFocusState> =
    new EventEmitter();
  private contentStateUpdated$: EventEmitter<ContentFocusState> =
    new EventEmitter();
  private updateCommentState$: EventEmitter<CommentFocusState> =
    new EventEmitter();
  private commentStateUpdated$: EventEmitter<CommentFocusState> =
    new EventEmitter();
  private updateFeedbackState$: EventEmitter<FeedbackFocusState> =
    new EventEmitter();
  private feedbackStateUpdated$: EventEmitter<FeedbackFocusState> =
    new EventEmitter();
  private focusModeStateUpdated$: EventEmitter<boolean> = new EventEmitter();
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
    contentGroupName: string,
    resultsVisible: boolean,
    correctAnswersVisible: boolean
  ) {
    const contentState = new ContentFocusState(
      contentId,
      contentIndex,
      contentGroupId,
      contentGroupName,
      resultsVisible,
      correctAnswersVisible
    );
    this.updateContentState$.emit(contentState);
  }

  getContentStateChange(): Observable<ContentFocusState> {
    return this.updateContentState$;
  }

  // Content state has updated
  updateContentStateWithObject(state: ContentFocusState) {
    this.contentStateUpdated$.emit(state);
  }
  updateContentState(
    contentId: string,
    contentIndex: number,
    contentGroupId: string,
    contentGroupName: string,
    resultsVisible: boolean,
    correctAnswersVisible: boolean
  ) {
    const contentState = new ContentFocusState(
      contentId,
      contentIndex,
      contentGroupId,
      contentGroupName,
      resultsVisible,
      correctAnswersVisible
    );
    this.contentStateUpdated$.emit(contentState);
  }

  getContentState(): Observable<ContentFocusState> {
    return this.contentStateUpdated$;
  }

  // COMMENTS
  // Update comment state
  updateCommentStateChange(commentId: string) {
    this.updateCommentState$.emit(new CommentFocusState(commentId));
  }

  getCommentStateChange(): Observable<CommentFocusState> {
    return this.updateCommentState$;
  }

  // Comment state updated
  updateCommentState(commentId: string) {
    this.commentStateUpdated$.emit(new CommentFocusState(commentId));
  }

  getCommentState(): Observable<CommentFocusState> {
    return this.commentStateUpdated$;
  }

  // Feedback
  // Update feedback state
  updateFeedbackStateChange(started: boolean) {
    this.updateFeedbackState$.emit(new FeedbackFocusState(started));
  }

  getFeedbackStateChange(): Observable<FeedbackFocusState> {
    return this.updateFeedbackState$;
  }

  // Feedback state updated
  getFeedbackState(): Observable<FeedbackFocusState> {
    return this.feedbackStateUpdated$;
  }

  updateFeedbackState(started: boolean) {
    this.feedbackStateUpdated$.emit(new FeedbackFocusState(started));
  }

  // Focus mode state updated
  updateFocusModeState(isGuided: boolean) {
    this.isGuided = isGuided;
    this.focusModeStateUpdated$.emit(isGuided);
  }

  getFocusModeState(): Observable<boolean> {
    return this.focusModeStateUpdated$;
  }

  // Content UI State
  updateUiState(state: ContentFocusState) {
    const uiState = new UiState(
      state.contentId,
      state.resultsVisible,
      state.correctAnswersVisible,
      false
    );
    this.uiStateUpdated$.emit(uiState);
  }

  getUiState(): Observable<UiState> {
    return this.uiStateUpdated$;
  }
}
