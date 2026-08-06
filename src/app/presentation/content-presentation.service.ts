import { computed, inject, Injectable, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  Content,
  QuestionnaireContentsByQuestionnaireIdGql,
  QuestionnaireUpdatedGql,
} from '@gql/generated/graphql';
import { catchError, EMPTY, map, of, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ContentPresentationService {
  private readonly contentsByQuestionnareId = inject(
    QuestionnaireContentsByQuestionnaireIdGql
  );
  private readonly questionnaireUpdated = inject(QuestionnaireUpdatedGql);
  private _questionnaireId = signal<string | undefined>(undefined);
  private _currentContentIndex = signal(0);

  private readonly activeRoundId = toSignal(
    toObservable(this._questionnaireId).pipe(
      switchMap((questionnaireId) => {
        if (!questionnaireId) {
          return EMPTY;
        }
        return this.questionnaireUpdated
          .subscribe({ variables: { questionnaireId } })
          .pipe(
            map((r) => r.data?.questionnaireUpdated?.activeRound?.id),
            catchError(() => EMPTY)
          );
      })
    )
  );

  private readonly contentsKey = computed(() =>
    [this._questionnaireId(), this.activeRoundId()].join('|')
  );

  private readonly contentsResult = toSignal(
    toObservable(this.contentsKey).pipe(
      switchMap(() => {
        const questionnaireId = this._questionnaireId();
        if (!questionnaireId) {
          return of();
        }
        return this.contentsByQuestionnareId.watch({
          variables: { questionnaireId },
          fetchPolicy: 'network-only',
        }).valueChanges;
      })
    )
  );
  readonly contents = computed(() => {
    const edges =
      this.contentsResult()?.data?.questionnaireContentsByQuestionnaireId
        ?.edges;
    return edges?.map((e) => e?.node).filter((n): n is Content => !!n) ?? [];
  });

  readonly loadingContents = computed(() => this.contentsResult()?.loading);

  readonly currentContentIndex = this._currentContentIndex.asReadonly();

  readonly currentContent = computed(
    (): Content | undefined => this.contents()[this._currentContentIndex()]
  );

  setQuestionnaireId(id: string) {
    this._questionnaireId.set(id);
  }

  setCurrentContentIndex(index: number) {
    this._currentContentIndex.set(index);
  }
}
