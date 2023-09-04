import { Injectable } from '@angular/core';
import { CommentSort } from '@app/core/models/comment-sort.enum';
import { ContentGroup } from '@app/core/models/content-group';
import { CommentPresentationState } from '@app/core/models/events/comment-presentation-state';
import { PresentationStepPosition } from '@app/core/models/events/presentation-step-position.enum';
import { ContentPresentationState } from '@app/core/models/events/content-presentation-state';
import { RoundState } from '@app/core/models/events/round-state';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

const SCALE_FACTOR = 1000;
const MIN_SCALE = 1;
const MAX_SCALE = 1.9;

@Injectable()
export class PresentationService {
  private currentGroup$ = new Subject<string>();
  private feedbackStarted$ = new Subject<boolean>();
  private contentState$ = new BehaviorSubject<
    ContentPresentationState | undefined
  >(undefined);
  private conmmentState$ = new BehaviorSubject<
    CommentPresentationState | undefined
  >(undefined);
  private multipleRoundState$ = new BehaviorSubject<boolean | undefined>(
    undefined
  );

  private commentSortChanged = new Subject<CommentSort>();
  private commentZoomChanged = new Subject<number>();
  private contentGroupUpdated = new Subject<ContentGroup>();
  private roundStateChanged = new Subject<RoundState>();

  getScale() {
    return Math.min(Math.max(innerWidth / SCALE_FACTOR, MIN_SCALE), MAX_SCALE);
  }

  getStepState(index: number, listLength: number) {
    let state = PresentationStepPosition.MIDDLE;
    if (index === 0) {
      state = PresentationStepPosition.START;
    } else if (index === listLength - 1) {
      state = PresentationStepPosition.END;
    }
    return state;
  }

  getCurrentGroup(): Observable<string> {
    return this.currentGroup$;
  }

  updateCurrentGroup(group: string) {
    this.currentGroup$.next(group);
  }

  // States

  getContentState(): Observable<ContentPresentationState | undefined> {
    return this.contentState$;
  }

  updateContentState(state: ContentPresentationState) {
    this.contentState$.next(state);
  }

  getCommentState(): Observable<CommentPresentationState | undefined> {
    return this.conmmentState$;
  }

  updateCommentState(state: CommentPresentationState) {
    this.conmmentState$.next(state);
  }

  getMultipleRoundState(): Observable<boolean | undefined> {
    return this.multipleRoundState$;
  }

  updateMultipleRoundState(state: boolean) {
    this.multipleRoundState$.next(state);
  }

  // Events

  getCommentSortChanges(): Observable<CommentSort> {
    return this.commentSortChanged;
  }

  updateCommentSort(sort: CommentSort) {
    this.commentSortChanged.next(sort);
  }

  getCommentZoomChanges(): Observable<number> {
    return this.commentZoomChanged;
  }

  updateCommentZoom(zoom: number) {
    this.commentZoomChanged.next(zoom);
  }

  updateContentGroup(group: ContentGroup) {
    this.contentGroupUpdated.next(group);
  }

  getContentGroupChanges(): Observable<ContentGroup> {
    return this.contentGroupUpdated;
  }

  updateRoundState(state: RoundState) {
    this.roundStateChanged.next(state);
  }

  getRoundStateChanges(): Observable<RoundState> {
    return this.roundStateChanged;
  }

  getFeedbackStarted(): Observable<boolean> {
    return this.feedbackStarted$;
  }

  updateFeedbackStarted(started: boolean) {
    this.feedbackStarted$.next(started);
  }
}
