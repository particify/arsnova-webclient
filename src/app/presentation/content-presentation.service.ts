import { computed, inject, Injectable, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  Content,
  Questionnaire,
  QuestionnaireByIdGql,
  QuestionnaireContentsByQuestionnaireIdGql,
  QuestionnaireUpdatedGql,
} from '@gql/generated/graphql';
import {
  catchError,
  EMPTY,
  filter,
  ignoreElements,
  map,
  of,
  switchMap,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ContentPresentationService {
  private readonly contentsByQuestionnareId = inject(
    QuestionnaireContentsByQuestionnaireIdGql
  );
  private readonly questionnaireById = inject(QuestionnaireByIdGql);
  private readonly questionnaireUpdated = inject(QuestionnaireUpdatedGql);
  private _questionnaireId = signal<string | undefined>(undefined);
  private _currentContentIndex = signal(0);

  private readonly questionnaire = toSignal(
    toObservable(this._questionnaireId).pipe(
      switchMap((id) => {
        if (!id) {
          return of(undefined);
        }
        return this.questionnaireById
          .watch({ variables: { id } })
          .valueChanges.pipe(
            map((r) => r.data?.questionnaireById),
            filter((n): n is Questionnaire => !!n)
          );
      })
    )
  );

  /** The pushes land in the cache, and so in the watched questionnaire. */
  private readonly questionnaireUpdates = toSignal(
    toObservable(this._questionnaireId).pipe(
      switchMap((questionnaireId) => {
        if (!questionnaireId) {
          return EMPTY;
        }
        return this.questionnaireUpdated
          .subscribe({ variables: { questionnaireId } })
          .pipe(
            ignoreElements(),
            catchError(() => EMPTY)
          );
      })
    )
  );

  /** Only a new round leaves the contents referencing the previous one. */
  private readonly contentsKey = computed(() => {
    const questionnaire = this.questionnaire();
    return questionnaire
      ? [questionnaire.id, questionnaire.activeRound?.id].join('|')
      : undefined;
  });

  private readonly contentsResult = toSignal(
    toObservable(this.contentsKey).pipe(
      switchMap((key) => {
        const questionnaireId = this.questionnaire()?.id;
        if (!key || !questionnaireId) {
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
