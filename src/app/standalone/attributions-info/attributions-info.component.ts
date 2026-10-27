import { Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatListModule } from '@angular/material/list';
import {
  QuestionnaireContentsByQuestionnaireIdGql,
  TemplateContentAttributionsByQuestionnaireIdGql,
} from '@gql/generated/graphql';
import { provideTranslocoScope, TranslocoPipe } from '@jsverse/transloco';
import { onlyCompleteData } from 'apollo-angular';
import { catchError, EMPTY, map, switchMap } from 'rxjs';

export interface UpstreamAttributionItem {
  attribution?: string | null;
  licenseName?: string;
}

export interface ContentAttributionItem {
  attribution?: string | null;
  contentId: string;
  contentNumber: number;
  licenseName?: string;
  /** The credits further up the chain of templates, nearest first. */
  upstream: UpstreamAttributionItem[];
}

/**
 * Contents copied from a template without a licence credit nobody, as in v3,
 * unless a template further up the chain had one. CC0 still counts.
 */
export function isLicensedAttribution(attribution: {
  license?: unknown;
  upstreamAttributions: { license?: unknown }[];
}): boolean {
  return (
    !!attribution.license ||
    attribution.upstreamAttributions.some((upstream) => !!upstream.license)
  );
}

@Component({
  selector: 'app-attributions-info',
  imports: [TranslocoPipe, MatListModule],
  providers: [provideTranslocoScope('creator')],
  templateUrl: './attributions-info.component.html',
  styleUrl: './attributions-info.component.scss',
})
export class AttributionsInfoComponent {
  private readonly attributionsByQuestionnaireId = inject(
    TemplateContentAttributionsByQuestionnaireIdGql
  );
  private readonly contentsByQuestionnaireId = inject(
    QuestionnaireContentsByQuestionnaireIdGql
  );

  readonly questionnaireId = input.required<string>();

  private readonly attributions = toSignal(
    toObservable(this.questionnaireId).pipe(
      switchMap((questionnaireId) =>
        this.attributionsByQuestionnaireId
          .watch({ variables: { questionnaireId } })
          .valueChanges.pipe(
            onlyCompleteData(),
            map((r) => r.data.templateContentAttributionsByQuestionnaireId),
            catchError(() => EMPTY)
          )
      )
    ),
    { initialValue: [] }
  );

  private readonly contentIds = toSignal(
    toObservable(this.questionnaireId).pipe(
      switchMap((questionnaireId) =>
        this.contentsByQuestionnaireId
          .watch({ variables: { questionnaireId } })
          .valueChanges.pipe(
            onlyCompleteData(),
            map(
              (r) =>
                r.data.questionnaireContentsByQuestionnaireId?.edges?.map(
                  (e) => e?.node?.id
                ) ?? []
            )
          )
      )
    ),
    { initialValue: [] }
  );

  /** Numbered by the content's place in the series; deleted contents drop out. */
  readonly items = computed<ContentAttributionItem[]>(() => {
    const contentIds = this.contentIds();
    return this.attributions()
      .filter(isLicensedAttribution)
      .map((a) => ({
        attribution: a.attribution,
        contentId: a.contentId,
        contentNumber: contentIds.indexOf(a.contentId) + 1,
        licenseName: a.license?.name,
        // As for the contents themselves, a template without a licence
        // credits nobody.
        upstream: a.upstreamAttributions
          .filter((u) => !!u.license)
          .map((u) => ({
            attribution: u.attribution,
            licenseName: u.license?.name,
          })),
      }))
      .filter((item) => item.contentNumber > 0)
      .sort((a, b) => a.contentNumber - b.contentNumber);
  });
}
