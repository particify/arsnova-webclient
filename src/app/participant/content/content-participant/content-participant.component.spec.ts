import { NgClass, NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContentService } from '@app/core/services/http/content.service';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { FocusModeService } from '@app/participant/_services/focus-mode.service';
import { ContentChoiceParticipantComponent } from '@app/participant/content/content-choice-participant/content-choice-participant.component';
import { ContentWordcloudParticipantComponent } from '@app/participant/content/content-wordcloud-participant/content-wordcloud-participant.component';
import {
  Answer,
  AnswerResultState,
  Content,
  ContentAnswerResult,
  ContentType,
  CreateQuestionnaireAbstentionGql,
  CreateQuestionnaireChoiceAnswerGql,
  CreateQuestionnaireWordcloudAnswerGql,
  CurrentUserWithSettingsGql,
  Questionnaire,
  QuestionnaireAnswerByRoundIdGql,
  QuestionnairePublishingMode,
  UserUiSettings,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { Apollo } from 'apollo-angular';
import { NEVER, of } from 'rxjs';
import { ContentResultsComponent } from '@app/standalone/content-results/content-results.component';
import { By } from '@angular/platform-browser';
import { ContentParticipantComponent } from './content-participant.component';
import { HotkeyDirective } from '@app/core/directives/hotkey.directive';
import { LanguageDirectionPipe } from '@app/core/pipes/language-direction.pipe';
import { MatTabLink, MatTabNav, MatTabNavPanel } from '@angular/material/tabs';
import { TranslocoPipe } from '@jsverse/transloco';

describe('ContentParticipantComponent', () => {
  let fixture: ComponentFixture<ContentParticipantComponent>;
  let component: ContentParticipantComponent;
  let answerByRoundId: jasmine.SpyObj<QuestionnaireAnswerByRoundIdGql>;
  let createAbstention: jasmine.SpyObj<CreateQuestionnaireAbstentionGql>;
  let cache: { modify: jasmine.Spy; updateQuery: jasmine.Spy };

  const choiceContent = {
    id: 'c-1',
    body: 'Which one?',
    abstentionsAllowed: true,
    activeRound: { id: 'round-1', roundNo: 1 },
    formatData: {
      format: ContentType.Choice,
      multiple: false,
      options: [{ label: 'A' }, { label: 'B' }],
    },
  } as Content;

  const wordcloudContent = {
    id: 'c-2',
    body: 'Which words?',
    activeRound: { id: 'round-2', roundNo: 1 },
    formatData: { format: ContentType.Wordcloud, maxAnswers: 3 },
  } as Content;

  interface SetUpOptions {
    answer?: Partial<Answer>;
    inputs?: Record<string, unknown>;
  }

  function setUp(content: Content = choiceContent, options: SetUpOptions = {}) {
    // CoreModule stays out: loaded from here, its import cycle through
    // HotkeyService and DialogService leaves HotkeyDirective undefined in it.
    TestBed.overrideComponent(ContentParticipantComponent, {
      set: {
        imports: [
          ContentResultsComponent,
          HotkeyDirective,
          LanguageDirectionPipe,
          MatTabLink,
          MatTabNav,
          MatTabNavPanel,
          NgClass,
          NgComponentOutlet,
          NgTemplateOutlet,
          TranslocoPipe,
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });
    for (const child of [
      ContentChoiceParticipantComponent,
      ContentResultsComponent,
      ContentWordcloudParticipantComponent,
    ]) {
      TestBed.overrideComponent(child, { set: { template: '', imports: [] } });
    }
    answerByRoundId = jasmine.createSpyObj('QuestionnaireAnswerByRoundIdGql', [
      'watch',
    ]);
    answerByRoundId.watch.and.returnValue({
      valueChanges: of({
        dataState: 'complete',
        loading: false,
        data: { questionnaireAnswerByRoundId: options.answer ?? null },
      }),
    } as never);
    createAbstention = jasmine.createSpyObj(
      'CreateQuestionnaireAbstentionGql',
      ['mutate']
    );
    createAbstention.mutate.and.returnValue(
      of({
        data: {
          createQuestionnaireAbstention: {
            id: 'answer-1',
            result: AnswerResultState.Abstained,
          },
        },
      }) as never
    );
    cache = jasmine.createSpyObj('InMemoryCache', ['modify', 'updateQuery']);
    const focusModeService = jasmine.createSpyObj('FocusModeService', [
      'getFocusModeEnabled',
    ]);
    focusModeService.getFocusModeEnabled.and.returnValue(of(false));
    const mutationSpy = (name: string) => {
      const spy = jasmine.createSpyObj(name, ['mutate']);
      spy.mutate.and.returnValue(NEVER);
      return spy;
    };

    configureTestModule(
      [getTranslocoModule()],
      [
        { provide: Apollo, useValue: { client: { cache } } },
        { provide: FocusModeService, useValue: focusModeService },
        { provide: QuestionnaireAnswerByRoundIdGql, useValue: answerByRoundId },
        {
          provide: CreateQuestionnaireAbstentionGql,
          useValue: createAbstention,
        },
        {
          provide: CreateQuestionnaireChoiceAnswerGql,
          useValue: mutationSpy('CreateQuestionnaireChoiceAnswerGql'),
        },
        {
          provide: CreateQuestionnaireWordcloudAnswerGql,
          useValue: mutationSpy('CreateQuestionnaireWordcloudAnswerGql'),
        },
        { provide: FormattingService, useValue: { postString: () => of('') } },
        { provide: ContentService, useValue: { updateAnswerCounts: () => {} } },
        {
          provide: CurrentUserWithSettingsGql,
          useValue: { fetch: () => of({ data: {} }) },
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', [
            'showAdvanced',
          ]),
        },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(ContentParticipantComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('shortId', '12345678');
    fixture.componentRef.setInput('questionnaire', {
      id: 'q-1',
    } as Questionnaire);
    fixture.componentRef.setInput('content', content);
    fixture.componentRef.setInput('roomId', 'room-1');
    fixture.componentRef.setInput('userId', 'user-1');
    fixture.componentRef.setInput('settings', {} as UserUiSettings);
    fixture.componentRef.setInput('index', 0);
    fixture.componentRef.setInput('language', 'en');
    for (const [name, value] of Object.entries(options.inputs ?? {})) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  }

  function answerForm<T>(type: new (...args: never[]) => T): T {
    return fixture.debugElement.query(
      (e) => e.componentInstance instanceof type
    ).componentInstance;
  }

  it('loads the own answer of the active round', () => {
    setUp();

    expect(answerByRoundId.watch).toHaveBeenCalledWith({
      variables: { roundId: 'round-1' },
      fetchPolicy: 'no-cache',
    });
  });

  it('renders the answer form of the content format', () => {
    setUp(wordcloudContent);

    const form = answerForm(ContentWordcloudParticipantComponent);
    expect(form.roundId()).toBe('round-2');
    expect(form.contentId()).toBe('c-2');
  });

  it('hands the submission to the answer form', () => {
    setUp();
    const form = answerForm(ContentChoiceParticipantComponent);
    spyOn(form, 'submitAnswer');

    component.submitAnswer();

    expect(form.submitAnswer).toHaveBeenCalled();
  });

  it('abstains in the active round', () => {
    setUp();

    component.submitAbstention();

    expect(createAbstention.mutate).toHaveBeenCalledWith({
      variables: { roundId: 'round-1' },
    });
    expect(component.answer()?.result).toBe(AnswerResultState.Abstained);
    expect(component.abstained()).toBeTrue();
  });

  it('marks only this content as abstained in the questionnaire results', () => {
    setUp();

    component.submitAbstention();

    const [options, update] = cache.updateQuery.calls.mostRecent().args as [
      { variables: unknown },
      (data: unknown) => {
        questionnaireContentAnswerResultsByQuestionnaireId: ContentAnswerResult[];
      },
    ];
    expect(options.variables).toEqual({ questionnaireId: 'q-1' });
    const updated = update({
      questionnaireContentAnswerResultsByQuestionnaireId: [
        { contentId: 'c-1', result: AnswerResultState.Unanswered },
        { contentId: 'c-3', result: AnswerResultState.Unanswered },
      ],
    });
    expect(
      updated.questionnaireContentAnswerResultsByQuestionnaireId.map(
        (r) => r.result
      )
    ).toEqual([AnswerResultState.Abstained, AnswerResultState.Unanswered]);
  });

  it('does not abstain without an active round', () => {
    setUp({ ...choiceContent, activeRound: undefined });

    component.submitAbstention();

    expect(createAbstention.mutate).not.toHaveBeenCalled();
  });

  it('takes over the answer created by the answer form', () => {
    setUp();
    const form = answerForm(ContentChoiceParticipantComponent);

    form.answerCreated.emit({
      id: 'answer-1',
      result: AnswerResultState.Neutral,
    } as Answer);

    expect(component.answer()?.id).toBe('answer-1');
    expect(cache.updateQuery).toHaveBeenCalled();
  });

  describe('in its template', () => {
    const answer = { id: 'answer-1', result: AnswerResultState.Neutral };
    const statsPublished = { statsPublished: true };

    function results() {
      return fixture.debugElement.query(By.directive(ContentResultsComponent))
        .componentInstance as ContentResultsComponent;
    }

    function showResults() {
      component.selectedRoute = 'results';
      fixture.detectChanges();
    }

    it('keeps the correct answers hidden until they are published', () => {
      setUp(choiceContent, { answer, inputs: statsPublished });
      showResults();

      expect(results().showCorrect()).toBeFalse();
    });

    it('shows the correct answers once they are published', () => {
      setUp(choiceContent, {
        answer,
        inputs: { ...statsPublished, correctOptionsPublished: true },
      });
      showResults();

      expect(results().showCorrect()).toBeTrue();
    });

    it('only enables the tab hotkeys of the active content', () => {
      setUp(choiceContent, { answer, inputs: statsPublished });
      const hotkeys = () =>
        fixture.debugElement
          .queryAll(By.directive(HotkeyDirective))
          .map((e) => e.injector.get(HotkeyDirective).appHotkeyDisabled);
      expect(hotkeys().length).toBeGreaterThan(0);
      expect(hotkeys().every((disabled) => disabled)).toBeTrue();

      fixture.componentRef.setInput('active', true);
      fixture.detectChanges();

      expect(hotkeys().every((disabled) => !disabled)).toBeTrue();
    });

    it('confirms a vote without a placeholder answering time', () => {
      setUp(choiceContent, { answer });

      const text = fixture.nativeElement.textContent;
      expect(text).toContain('participant.answer.has-voted');
      expect(text).not.toContain('participant.answer.answered-in-time');
    });

    it('confirms an abstention', () => {
      setUp(choiceContent, {
        answer: { id: 'answer-1', result: AnswerResultState.Abstained },
      });

      expect(fixture.nativeElement.textContent).toContain(
        'participant.answer.has-abstained'
      );
    });

    it('shows that answering has not started without an active round', () => {
      setUp({ ...choiceContent, activeRound: undefined });

      expect(component.loadingAnswer()).toBeFalse();
      expect(
        fixture.nativeElement.querySelector('app-loading-indicator')
      ).toBeNull();
      expect(fixture.nativeElement.textContent).toContain(
        'participant.answer.answering-not-started'
      );
      expect(answerByRoundId.watch).not.toHaveBeenCalled();
    });

    it('shows a slide without an active round', () => {
      setUp({
        ...choiceContent,
        activeRound: undefined,
        formatData: { format: ContentType.Slide },
      } as Content);

      expect(component.loadingAnswer()).toBeFalse();
      expect(fixture.nativeElement.textContent).not.toContain(
        'participant.answer.answering-not-started'
      );
    });

    it('drops the answer of a round that is no longer active', () => {
      setUp(choiceContent, { answer });
      expect(component.answer()?.id).toBe('answer-1');

      fixture.componentRef.setInput('content', {
        ...choiceContent,
        activeRound: undefined,
      });
      fixture.detectChanges();

      expect(component.answer()).toBeUndefined();
      expect(fixture.nativeElement.textContent).toContain(
        'participant.answer.answering-not-started'
      );
    });

    it('lets participants of a live quiz wait without an answer', () => {
      setUp(
        { ...choiceContent, position: 0 },
        {
          inputs: {
            questionnaire: {
              id: 'q-1',
              contentCount: 3,
              leaderboardEnabled: true,
              publishingMode: QuestionnairePublishingMode.Live,
            },
          },
        }
      );

      expect(
        fixture.nativeElement.querySelector('app-content-waiting')
      ).not.toBeNull();
    });

    it('stops waiting once answered', () => {
      setUp(
        { ...choiceContent, position: 0 },
        {
          answer,
          inputs: {
            questionnaire: {
              id: 'q-1',
              contentCount: 3,
              leaderboardEnabled: true,
              publishingMode: QuestionnairePublishingMode.Live,
            },
          },
        }
      );

      expect(
        fixture.nativeElement.querySelector('app-content-waiting')
      ).toBeNull();
    });
  });
});
