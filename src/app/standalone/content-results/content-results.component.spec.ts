import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import { ContentService } from '@app/core/services/http/content.service';
import {
  Content,
  ContentType,
  CurrentUserWithSettingsGql,
  QuestionnaireRoundsByContentIdGql,
  Round,
  UserUiSettings,
} from '@gql/generated/graphql';
import { ContentResultsComponent } from './content-results.component';
import { ContentResultsService } from './content-results.service';

function choiceContent(): Content {
  return {
    __typename: 'Content',
    id: 'content-1',
    body: 'Which one is correct?',
    hasCorrectAnswer: true,
    answerCount: 4,
    correctAnswerCount: 3,
    hasAnswers: true,
    formatData: {
      __typename: 'ChoiceContentFormatData',
      format: ContentType.Choice,
      multiple: false,
      correctOptionIndexes: [0],
      options: [
        { __typename: 'AnswerOption', label: 'Answer 1' },
        { __typename: 'AnswerOption', label: 'Answer 2' },
      ],
    },
  };
}

function shortAnswerContent(): Content {
  return {
    __typename: 'Content',
    id: 'content-2',
    body: 'Capital of France?',
    hasCorrectAnswer: true,
    answerCount: 5,
    correctAnswerCount: 4,
    hasAnswers: true,
    abstentionCount: 1,
    formatData: {
      __typename: 'ShortAnswerContentFormatData',
      format: ContentType.ShortAnswer,
      correctTerms: ['Paris'],
    },
  };
}

function sortContent(): Content {
  return {
    __typename: 'Content',
    id: 'content-3',
    body: 'Order the planets by distance to the sun',
    hasCorrectAnswer: true,
    answerCount: 6,
    correctAnswerCount: 2,
    hasAnswers: true,
    formatData: {
      __typename: 'SortContentFormatData',
      format: ContentType.Sort,
      options: [
        { __typename: 'AnswerOption', label: 'Earth' },
        { __typename: 'AnswerOption', label: 'Mercury' },
      ],
      correctOrder: [1, 0],
    },
  };
}

function prioritizationContent(): Content {
  return {
    __typename: 'Content',
    id: 'content-4',
    body: 'What should change?',
    hasCorrectAnswer: false,
    answerCount: 6,
    hasAnswers: true,
    formatData: {
      __typename: 'PrioritizationContentFormatData',
      format: ContentType.Prioritization,
      assignablePoints: 100,
      options: [
        { __typename: 'AnswerOption', label: 'More exercises' },
        { __typename: 'AnswerOption', label: 'Shorter lectures' },
      ],
    },
  };
}

function binaryContent(): Content {
  return {
    __typename: 'Content',
    id: 'content-5',
    body: 'Is the earth round?',
    hasCorrectAnswer: true,
    answerCount: 10,
    correctAnswerCount: 9,
    formatData: {
      __typename: 'BinaryContentFormatData',
      format: ContentType.Binary,
      correctAnswer: true,
    },
  };
}

describe('ContentResultsComponent', () => {
  let fixture: ComponentFixture<ContentResultsComponent>;
  let component: ContentResultsComponent;
  let contentResultsService: ContentResultsService;
  let refetchRounds: jasmine.Spy;

  interface SetUpOptions {
    content?: Content;
    isPresentation?: boolean;
    showCorrect?: boolean;
    settings?: UserUiSettings;
  }

  /**
   * Left inactive and non-standalone, so only the derivation of the inputs
   * handed to the format's results component is exercised.
   */
  function setUp(options: SetUpOptions = {}) {
    refetchRounds = jasmine.createSpy('refetch').and.resolveTo({});
    configureTestModule(
      [getTranslocoModule(), ContentResultsComponent],
      [
        { provide: ContentService, useValue: { updateAnswerCounts: () => {} } },
        {
          provide: CurrentUserWithSettingsGql,
          useValue: { fetch: () => of({ data: {} }) },
        },
        {
          provide: QuestionnaireRoundsByContentIdGql,
          useValue: {
            watch: () => ({
              valueChanges: of({
                dataState: 'complete' as const,
                data: {
                  questionnaireRoundsByContentId: [
                    {
                      __typename: 'Round',
                      id: 'round-1',
                      roundNo: 1,
                      closed: false,
                    },
                  ],
                },
              }),
              refetch: refetchRounds,
            }),
          },
        },
      ]
    ).compileComponents();

    contentResultsService = TestBed.inject(ContentResultsService);

    fixture = TestBed.createComponent(ContentResultsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput(
      'content',
      options.content ?? choiceContent()
    );
    fixture.componentRef.setInput(
      'settings',
      options.settings ?? ({} as UserUiSettings)
    );
    fixture.componentRef.setInput('isPresentation', !!options.isPresentation);
    fixture.componentRef.setInput('showCorrect', !!options.showCorrect);
    fixture.detectChanges();
  }

  function scoringInputs(): { showCorrect: boolean; isPresentation: boolean } {
    return component.componentInputs() as {
      showCorrect: boolean;
      isPresentation: boolean;
    };
  }

  it('reveals the correct answers in presentation only once toggled', () => {
    setUp({ isPresentation: true, showCorrect: true });
    expect(scoringInputs().showCorrect).toBe(false);

    contentResultsService.setCorrectResultsVisible(true);
    expect(scoringInputs().showCorrect).toBe(true);
  });

  it('reveals the correct answers outside presentation by entitlement', () => {
    setUp({ showCorrect: true });
    expect(scoringInputs().showCorrect).toBe(true);
  });

  it('keeps the correct answers hidden without entitlement', () => {
    setUp();
    contentResultsService.setCorrectResultsVisible(true);
    expect(scoringInputs().showCorrect).toBe(false);
  });

  it('tells a scored format that it renders in presentation', () => {
    setUp({ isPresentation: true });
    expect(scoringInputs().isPresentation).toBe(true);
  });

  it('tells a scored format that it renders outside presentation', () => {
    setUp();
    expect(scoringInputs().isPresentation).toBe(false);
  });

  it('tells a choice format how many participants have answered', () => {
    setUp();
    expect(
      (component.componentInputs() as { answerCount: number }).answerCount
    ).toBe(4);
  });

  it('counts no answers while the count is withheld from the participant', () => {
    setUp({
      content: {
        ...choiceContent(),
        answerCount: null,
        correctAnswerCount: null,
      },
    });
    expect(
      (component.componentInputs() as { answerCount: number }).answerCount
    ).toBe(0);
  });

  it('reloads the rounds once another round of the content became active', () => {
    setUp({
      content: { ...choiceContent(), activeRound: { id: 'round-1' } as Round },
    });
    expect(refetchRounds).not.toHaveBeenCalled();

    fixture.componentRef.setInput('content', {
      ...choiceContent(),
      activeRound: { id: 'round-2' } as Round,
    });
    fixture.detectChanges();

    expect(refetchRounds).toHaveBeenCalledTimes(1);
  });

  it('keeps the rounds while the same round stays active', () => {
    setUp({
      content: { ...choiceContent(), activeRound: { id: 'round-1' } as Round },
    });

    fixture.componentRef.setInput('content', {
      ...choiceContent(),
      answerCount: 5,
      activeRound: { id: 'round-1' } as Round,
    });
    fixture.detectChanges();

    expect(refetchRounds).not.toHaveBeenCalled();
  });

  it('lets a wordcloud ban keywords only where answers may be moderated', () => {
    setUp();
    fixture.componentRef.setInput('content', {
      ...choiceContent(),
      formatData: {
        __typename: 'WordcloudContentFormatData',
        format: ContentType.Wordcloud,
      },
    } as Content);
    const allowAnswerModeration = () =>
      (component.componentInputs() as { allowAnswerModeration: boolean })
        .allowAnswerModeration;
    expect(allowAnswerModeration()).toBeFalse();

    fixture.componentRef.setInput('allowAnswerModeration', true);
    expect(allowAnswerModeration()).toBeTrue();
  });

  it('hands a short answer its correct-answer summary without chart inputs', () => {
    setUp({ content: shortAnswerContent(), showCorrect: true });
    const inputs = component.componentInputs() as Record<string, unknown>;
    expect(inputs['showCorrect']).toBe(true);
    expect(inputs['hasCorrectAnswer']).toBe(true);
    expect(inputs['answerCount']).toBe(5);
    expect(inputs['correctAnswerCount']).toBe(4);
    expect(inputs['abstentionCount']).toBe(1);
    expect(inputs['formatData']).toEqual(shortAnswerContent().formatData);
    expect('rounds' in inputs).toBe(false);
    expect('visualizationUnitPercent' in inputs).toBe(false);
  });

  it('lets a short answer ban answers only where answers may be moderated', () => {
    setUp({ content: shortAnswerContent() });
    const inputs = () => component.componentInputs() as Record<string, unknown>;
    expect(inputs()['contentId']).toBe(shortAnswerContent().id);
    expect(inputs()['allowAnswerModeration']).toBe(false);

    fixture.componentRef.setInput('allowAnswerModeration', true);
    expect(inputs()['allowAnswerModeration']).toBe(true);
  });

  it('hands a sort its correct-answer summary, the visualization unit and the rounds', () => {
    setUp({
      content: sortContent(),
      showCorrect: true,
      settings: { contentVisualizationUnitPercent: true } as UserUiSettings,
    });
    const inputs = component.componentInputs() as Record<string, unknown>;
    expect(inputs['showCorrect']).toBe(true);
    expect(inputs['correctAnswerCount']).toBe(2);
    expect(inputs['formatData']).toEqual(sortContent().formatData);
    expect(inputs['visualizationUnitPercent']).toBe(true);
    // The rounds tell which of them are closed and need no updates.
    expect(inputs['rounds']).toEqual(component.rounds());
  });

  it('hands a prioritization its items, the visualization unit and the rounds only', () => {
    setUp({
      content: prioritizationContent(),
      showCorrect: true,
      settings: { contentVisualizationUnitPercent: true } as UserUiSettings,
    });
    const inputs = component.componentInputs() as Record<string, unknown>;
    expect(inputs['formatData']).toEqual(prioritizationContent().formatData);
    expect(inputs['visualizationUnitPercent']).toBe(true);
    expect('showCorrect' in inputs).toBe(false);
    expect(inputs['rounds']).toEqual(component.rounds());
  });

  it('hands a binary the scored chart inputs and the room language', () => {
    setUp({ content: binaryContent(), showCorrect: true });
    fixture.componentRef.setInput('language', 'de');
    const inputs = component.componentInputs() as Record<string, unknown>;
    expect(inputs['showCorrect']).toBe(true);
    expect(inputs['correctAnswerCount']).toBe(9);
    expect(inputs['language']).toBe('de');
    expect(inputs['rounds']).toEqual(component.rounds());
    expect('answersDirectlyBelowChart' in inputs).toBe(false);
  });
});
