import { Injectable, inject } from '@angular/core';
import { CommentSort } from '@app/core/models/comment-sort.enum';
import { ContentGroup } from '@app/core/models/content-group';
import { CommentPresentationState } from '@app/core/models/events/comment-presentation-state';
import { PresentationStepPosition } from '@app/core/models/events/presentation-step-position.enum';
import { ContentPresentationState } from '@app/core/models/events/content-presentation-state';
import { RoundState } from '@app/core/models/events/round-state';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Content } from '@app/core/models/content';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { CommentFilter } from '@app/core/models/comment-filter.enum';
import { CommentPeriod } from '@app/core/models/comment-period.enum';

const SCALE_FACTOR = 1080;
const MIN_SCALE = 1;
const ASPECT_RATIO = 0.6;

export const CARD_WIDTH = 640;

@Injectable()
export class PresentationService {
  private contentService = inject(ContentService);
  private contentGroupService = inject(ContentGroupService);

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

  private useRatioScale = true;
  private scaleFactor = SCALE_FACTOR;

  private commentSortChanged = new Subject<CommentSort>();
  private commentFilterChanged = new Subject<CommentFilter>();
  private commentCategoryChanged = new Subject<string>();
  private commentPeriodChanged = new Subject<CommentPeriod>();
  private commentZoomChanged = new Subject<number>();
  private contentGroupUpdated = new Subject<ContentGroup>();
  private roundStateChanged = new Subject<RoundState>();
  private countdownChanged = new Subject<Content>();
  private wordcloudVisualizationCHanged = new Subject<boolean>();
  private leaderboardDisplayed = new Subject<boolean>();

  private currentContent?: Content;

  getScale(factor = 1) {
    const ratioScale = innerHeight / innerWidth / ASPECT_RATIO;
    const deviceScale = parseFloat(
      (
        (innerWidth / this.scaleFactor) *
        (this.useRatioScale ? ratioScale : 1) *
        factor
      ).toFixed(1)
    );
    return Math.max(deviceScale, MIN_SCALE);
  }

  setUseRatioScale(useRatioScale: boolean): void {
    this.useRatioScale = useRatioScale;
  }

  setScaleFactor(scaleFactor: number): void {
    this.scaleFactor = scaleFactor;
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

  startContent(contentGroupId: string): void {
    if (this.currentContent) {
      this.contentGroupService
        .startContent(
          this.currentContent.roomId,
          contentGroupId,
          this.currentContent.id
        )
        .subscribe(() => {
          this.reloadCurrentContent();
        });
    }
  }

  stopContent(): void {
    if (this.currentContent) {
      this.contentService
        .stopContent(this.currentContent.roomId, this.currentContent.id)
        .subscribe(() => {
          this.reloadCurrentContent();
        });
    }
  }

  reloadCurrentContent(): void {
    if (this.currentContent) {
      this.contentService
        .getContent(this.currentContent.roomId, this.currentContent.id)
        .subscribe((content) => {
          this.currentContent = content;
          this.countdownChanged.next(content);
        });
    }
  }

  // States

  getContentState(): Observable<ContentPresentationState | undefined> {
    return this.contentState$;
  }

  updateContentState(state: ContentPresentationState) {
    this.contentState$.next(state);
    this.currentContent = state.content;
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

  getCommentFilterChanges(): Observable<CommentFilter> {
    return this.commentFilterChanged;
  }

  updateCommentFilter(filter: CommentFilter) {
    this.commentFilterChanged.next(filter);
  }

  getCommentCategoryChanges(): Observable<string> {
    return this.commentCategoryChanged;
  }

  updateCommentCategory(category: string) {
    this.commentCategoryChanged.next(category);
  }

  getCommentPeriodChanges(): Observable<CommentPeriod> {
    return this.commentPeriodChanged;
  }

  updateCommentPeriod(period: CommentPeriod) {
    this.commentPeriodChanged.next(period);
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

  getCountdownChanged(): Observable<Content> {
    return this.countdownChanged;
  }

  updateWordcloudVisualization(rotateWordcloudItems: boolean) {
    this.wordcloudVisualizationCHanged.next(rotateWordcloudItems);
  }

  getWordcloudVisualizationChanged(): Observable<boolean> {
    return this.wordcloudVisualizationCHanged;
  }

  updateLeaderboardDisplayed(displayLeaderboard: boolean) {
    this.leaderboardDisplayed.next(displayLeaderboard);
  }

  getLeaderboardDisplayed(): Observable<boolean> {
    return this.leaderboardDisplayed;
  }
}
