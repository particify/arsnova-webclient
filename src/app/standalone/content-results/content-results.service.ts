import {
  computed,
  inject,
  Injectable,
  linkedSignal,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CurrentUserWithSettingsGql } from '@gql/generated/graphql';
import { map } from 'rxjs';
import { VisualizationType } from './visualization/visualization-type';

@Injectable({ providedIn: 'root' })
export class ContentResultsService {
  private readonly settings = toSignal(
    inject(CurrentUserWithSettingsGql)
      .fetch()
      .pipe(
        map(
          (r) =>
            r.data?.currentUser?.uiSettings ?? {
              contentVisualizationUnitPercent: true,
              contentAnswersDirectlyBelowChart: false,
              showContentResultsDirectly: false,
              rotateWordcloudItems: true,
            }
        )
      )
  );
  private readonly _resultsVisible = linkedSignal(
    () => this.settings()?.showContentResultsDirectly ?? false
  );
  private readonly _correctResultsVisible = linkedSignal(
    () => this.settings()?.showContentResultsDirectly ?? false
  );
  private readonly _activeWordcloudVisualization = signal<string>(
    VisualizationType.WORDCLOUD
  );
  private readonly _presentationSelectedRoundIdsByContentId = signal<
    Record<string, string[]>
  >({});

  readonly resultsVisible = computed(() => this._resultsVisible());
  readonly correctResultsVisible = computed(() =>
    this._correctResultsVisible()
  );
  readonly activeWordcloudVisualization =
    this._activeWordcloudVisualization.asReadonly();

  setResultsVisible(visible: boolean) {
    this._resultsVisible.set(visible);
  }

  setCorrectResultsVisible(visible: boolean) {
    this._correctResultsVisible.set(visible);
  }

  setActiveWordcloudVizualization(visualization: string) {
    this._activeWordcloudVisualization.set(visualization);
  }

  presentationSelectedRoundIds(contentId: string): string[] | undefined {
    return this._presentationSelectedRoundIdsByContentId()[contentId];
  }

  setPresentationSelectedRoundIds(contentId: string, roundIds: string[]) {
    this._presentationSelectedRoundIdsByContentId.update((byContentId) => ({
      ...byContentId,
      [contentId]: roundIds,
    }));
  }
}
