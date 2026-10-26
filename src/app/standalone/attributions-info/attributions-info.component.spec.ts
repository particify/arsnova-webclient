import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  QuestionnaireContentsByQuestionnaireIdGql,
  TemplateContentAttributionsByQuestionnaireIdGql,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { BehaviorSubject, of } from 'rxjs';
import { AttributionsInfoComponent } from './attributions-info.component';

describe('AttributionsInfoComponent', () => {
  let fixture: ComponentFixture<AttributionsInfoComponent>;
  let component: AttributionsInfoComponent;
  let attributionsGql: jasmine.SpyObj<TemplateContentAttributionsByQuestionnaireIdGql>;
  let contents$: BehaviorSubject<unknown>;

  function contentsResult(ids: string[]) {
    return {
      dataState: 'complete',
      data: {
        questionnaireContentsByQuestionnaireId: {
          edges: ids.map((id) => ({ node: { id } })),
        },
      },
    };
  }

  beforeEach(() => {
    attributionsGql = jasmine.createSpyObj('AttributionsGql', ['watch']);
    attributionsGql.watch.and.returnValue({
      valueChanges: of({
        dataState: 'complete',
        data: {
          templateContentAttributionsByQuestionnaireId: [
            {
              contentId: 'c-3',
              templateId: 't-1',
              attribution: 'Ada Lovelace',
              license: { id: 'CC-BY-4.0', name: 'CC BY 4.0' },
              upstreamAttributions: [
                {
                  templateId: 't-0',
                  attribution: 'Grace Hopper',
                  license: { id: 'CC-BY-4.0', name: 'CC BY 4.0' },
                },
                {
                  templateId: 't-00',
                  attribution: null,
                  license: null,
                },
              ],
            },
            {
              contentId: 'c-1',
              templateId: 't-1',
              attribution: null,
              license: { id: 'CC0-1.0', name: 'CC0 1.0' },
              upstreamAttributions: [],
            },
            {
              contentId: 'c-2',
              templateId: 't-2',
              attribution: 'Ada Lovelace',
              license: null,
              upstreamAttributions: [
                { templateId: 't-0', attribution: null, license: null },
              ],
            },
            {
              contentId: 'c-gone',
              templateId: 't-1',
              attribution: 'Ada Lovelace',
              license: { id: 'CC-BY-4.0', name: 'CC BY 4.0' },
              upstreamAttributions: [],
            },
          ],
        },
      }),
    } as never);
    contents$ = new BehaviorSubject<unknown>(
      contentsResult(['c-1', 'c-2', 'c-3'])
    );
    const contentsGql = jasmine.createSpyObj('ContentsGql', ['watch']);
    contentsGql.watch.and.returnValue({ valueChanges: contents$ });

    configureTestModule(
      [getTranslocoModule(), AttributionsInfoComponent],
      [
        {
          provide: TemplateContentAttributionsByQuestionnaireIdGql,
          useValue: attributionsGql,
        },
        {
          provide: QuestionnaireContentsByQuestionnaireIdGql,
          useValue: contentsGql,
        },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(AttributionsInfoComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('questionnaireId', 'q-1');
    fixture.detectChanges();
  });

  it('queries the attributions of the questionnaire', () => {
    expect(attributionsGql.watch).toHaveBeenCalledOnceWith({
      variables: { questionnaireId: 'q-1' },
    });
  });

  it('numbers the attributed contents by their place in the series', () => {
    expect(component.items()).toEqual([
      {
        attribution: null,
        contentId: 'c-1',
        contentNumber: 1,
        licenseName: 'CC0 1.0',
        upstream: [],
      },
      {
        attribution: 'Ada Lovelace',
        contentId: 'c-3',
        contentNumber: 3,
        licenseName: 'CC BY 4.0',
        upstream: [{ attribution: 'Grace Hopper', licenseName: 'CC BY 4.0' }],
      },
    ]);
  });

  it('lists no content copied from a template without a licence', () => {
    expect(component.items().map((i) => i.contentId)).not.toContain('c-2');
  });

  it('renumbers the attributions when contents move', () => {
    contents$.next(contentsResult(['c-3', 'c-1']));

    expect(component.items().map((i) => i.contentNumber)).toEqual([1, 2]);
    expect(component.items().map((i) => i.contentId)).toEqual(['c-3', 'c-1']);
  });

  it('names an attribution without an author anonymous', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('general.anonymous');
    expect(text).toContain('Ada Lovelace, CC BY 4.0');
  });

  it('lists the upstream credits under the row of their content', () => {
    const rows: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('mat-list-item')
    );
    const credits = (row: HTMLElement) =>
      Array.from(row.querySelectorAll('.upstream-attribution')).map((c) =>
        c.textContent?.trim()
      );

    expect(rows.length).toBe(2);
    expect(credits(rows[0])).toEqual([]);
    // The unlicensed template further up credits nobody.
    expect(credits(rows[1])).toEqual([
      'creator.content.attribution-upstream, CC BY 4.0',
    ]);
  });

  it('leaves space between the upstream credits and the divider', () => {
    const row: HTMLElement =
      fixture.nativeElement.querySelectorAll('mat-list-item')[1];
    const credits = row.querySelectorAll('.upstream-attribution');
    const lastCredit = credits[credits.length - 1];
    expect(
      row.getBoundingClientRect().bottom -
        lastCredit.getBoundingClientRect().bottom
    ).toBeGreaterThanOrEqual(12);
  });
});
