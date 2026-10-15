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

describe('ContentResultsComponent', () => {
  let fixture: ComponentFixture<ContentResultsComponent>;
  let component: ContentResultsComponent;
  let contentResultsService: ContentResultsService;
  let refetchRounds: jasmine.Spy;

  interface SetUpOptions {
    content?: Partial<Content>;
    isPresentation?: boolean;
    showCorrect?: boolean;
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
    fixture.componentRef.setInput('content', {
      ...choiceContent(),
      ...options.content,
    });
    fixture.componentRef.setInput('settings', {} as UserUiSettings);
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
    setUp({ content: { answerCount: null, correctAnswerCount: null } });
    expect(
      (component.componentInputs() as { answerCount: number }).answerCount
    ).toBe(0);
  });

  it('reloads the rounds once another round of the content became active', () => {
    setUp({ content: { activeRound: { id: 'round-1' } as Round } });
    expect(refetchRounds).not.toHaveBeenCalled();

    fixture.componentRef.setInput('content', {
      ...choiceContent(),
      activeRound: { id: 'round-2' } as Round,
    });
    fixture.detectChanges();

    expect(refetchRounds).toHaveBeenCalledTimes(1);
  });

  it('keeps the rounds while the same round stays active', () => {
    setUp({ content: { activeRound: { id: 'round-1' } as Round } });

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
});
