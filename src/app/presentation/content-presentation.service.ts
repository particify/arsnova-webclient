import { computed, inject, Injectable, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  Content,
  QuestionnaireContentsByQuestionnaireIdGql,
} from '@gql/generated/graphql';
import { of, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ContentPresentationService {
  private readonly contentsByQuestionnareId = inject(
    QuestionnaireContentsByQuestionnaireIdGql
  );
  private _questionnaireId = signal<string | undefined>(undefined);
  private _currentContentIndex = signal(0);

  private readonly contentsResult = toSignal(
    toObservable(this._questionnaireId).pipe(
      switchMap((q) => {
        if (!q) {
          return of();
        } else {
          return this.contentsByQuestionnareId.watch({
            variables: { questionnaireId: q },
          }).valueChanges;
        }
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
