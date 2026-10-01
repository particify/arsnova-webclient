import { TestBed } from '@angular/core/testing';
import {
  QuestionnaireContentsByQuestionnaireIdGql,
  QuestionnaireUpdatedGql,
} from '@gql/generated/graphql';
import { Subject, of } from 'rxjs';
import { ContentPresentationService } from './content-presentation.service';

describe('ContentPresentationService', () => {
  let service: ContentPresentationService;
  let contentsGql: jasmine.SpyObj<QuestionnaireContentsByQuestionnaireIdGql>;
  let updated$: Subject<unknown>;

  beforeEach(() => {
    updated$ = new Subject();
    contentsGql = jasmine.createSpyObj(
      'QuestionnaireContentsByQuestionnaireIdGql',
      ['watch']
    );
    contentsGql.watch.and.returnValue({
      valueChanges: of({
        loading: false,
        data: {
          questionnaireContentsByQuestionnaireId: {
            edges: [{ node: { id: 'c-0' } }, { node: { id: 'c-1' } }],
          },
        },
      }),
    } as never);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: QuestionnaireContentsByQuestionnaireIdGql,
          useValue: contentsGql,
        },
        {
          provide: QuestionnaireUpdatedGql,
          useValue: { subscribe: () => updated$ },
        },
      ],
    });
    service = TestBed.inject(ContentPresentationService);
  });

  function activeRound(id: string) {
    updated$.next({
      data: { questionnaireUpdated: { activeRound: { id } } },
    });
    TestBed.tick();
  }

  it('loads the contents of the questionnaire', () => {
    service.setQuestionnaireId('q-1');
    TestBed.tick();

    expect(contentsGql.watch).toHaveBeenCalledWith({
      variables: { questionnaireId: 'q-1' },
      fetchPolicy: 'network-only',
    });
    expect(service.contents().map((c) => c.id)).toEqual(['c-0', 'c-1']);
  });

  it('reloads the contents whenever another round becomes active', () => {
    service.setQuestionnaireId('q-1');
    TestBed.tick();
    activeRound('round-1');
    const loads = contentsGql.watch.calls.count();

    activeRound('round-2');

    expect(contentsGql.watch.calls.count()).toBe(loads + 1);
  });

  it('does not reload the contents for other questionnaire updates', () => {
    service.setQuestionnaireId('q-1');
    TestBed.tick();
    activeRound('round-1');
    const loads = contentsGql.watch.calls.count();

    activeRound('round-1');

    expect(contentsGql.watch.calls.count()).toBe(loads);
  });

  it('presents the content at the current index', () => {
    service.setQuestionnaireId('q-1');
    TestBed.tick();

    service.setCurrentContentIndex(1);

    expect(service.currentContent()?.id).toBe('c-1');
  });
});
