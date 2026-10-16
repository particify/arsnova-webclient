import { TestBed } from '@angular/core/testing';
import {
  QuestionnaireByIdGql,
  QuestionnaireContentsByQuestionnaireIdGql,
  QuestionnaireUpdatedGql,
} from '@gql/generated/graphql';
import { Subject, of } from 'rxjs';
import { ContentPresentationService } from './content-presentation.service';

describe('ContentPresentationService', () => {
  let service: ContentPresentationService;
  let contentsGql: jasmine.SpyObj<QuestionnaireContentsByQuestionnaireIdGql>;
  let questionnaire$: Subject<unknown>;
  let updated$: Subject<unknown>;
  let questionnaireUpdated: jasmine.SpyObj<QuestionnaireUpdatedGql>;

  beforeEach(() => {
    questionnaire$ = new Subject();
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
    const questionnaireById = jasmine.createSpyObj('QuestionnaireByIdGql', [
      'watch',
    ]);
    questionnaireById.watch.and.returnValue({
      valueChanges: questionnaire$,
    });
    questionnaireUpdated = jasmine.createSpyObj('QuestionnaireUpdatedGql', [
      'subscribe',
    ]);
    questionnaireUpdated.subscribe.and.returnValue(updated$ as never);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: QuestionnaireContentsByQuestionnaireIdGql,
          useValue: contentsGql,
        },
        { provide: QuestionnaireByIdGql, useValue: questionnaireById },
        { provide: QuestionnaireUpdatedGql, useValue: questionnaireUpdated },
      ],
    });
    service = TestBed.inject(ContentPresentationService);
  });

  /** An emission of the watched query, from the network or the cache. */
  function questionnaireLoaded(activeRoundId?: string) {
    questionnaire$.next({
      data: {
        questionnaireById: {
          id: 'q-1',
          activeRound: activeRoundId ? { id: activeRoundId } : null,
        },
      },
    });
    TestBed.tick();
  }

  function present() {
    service.setQuestionnaireId('q-1');
    TestBed.tick();
  }

  it('loads the contents of the questionnaire once it has loaded', () => {
    present();
    expect(contentsGql.watch).not.toHaveBeenCalled();

    questionnaireLoaded('round-1');

    expect(contentsGql.watch).toHaveBeenCalledOnceWith({
      variables: { questionnaireId: 'q-1' },
      fetchPolicy: 'network-only',
    });
    expect(service.contents().map((c) => c.id)).toEqual(['c-0', 'c-1']);
  });

  it('listens to the questionnaire updates', () => {
    present();

    expect(questionnaireUpdated.subscribe).toHaveBeenCalledWith({
      variables: { questionnaireId: 'q-1' },
    });
  });

  it('does not reload the contents for the first push', () => {
    present();
    questionnaireLoaded('round-1');

    updated$.next({
      data: {
        questionnaireUpdated: { id: 'q-1', activeRound: { id: 'round-1' } },
      },
    });
    TestBed.tick();

    expect(contentsGql.watch).toHaveBeenCalledTimes(1);
  });

  it('reloads the contents whenever the questionnaire gets another active round', () => {
    present();
    questionnaireLoaded('round-1');

    questionnaireLoaded('round-2');

    expect(contentsGql.watch).toHaveBeenCalledTimes(2);
  });

  it('does not reload the contents for other questionnaire changes', () => {
    present();
    questionnaireLoaded('round-1');

    questionnaireLoaded('round-1');

    expect(contentsGql.watch).toHaveBeenCalledTimes(1);
  });

  it('presents the content at the current index', () => {
    present();
    questionnaireLoaded('round-1');

    service.setCurrentContentIndex(1);

    expect(service.currentContent()?.id).toBe('c-1');
  });
});
