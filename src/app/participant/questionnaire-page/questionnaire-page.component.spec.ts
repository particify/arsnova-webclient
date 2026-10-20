import { Type } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
  tick,
} from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { ContentCarouselService } from '@app/core/services/util/content-carousel.service';
import { FocusModeService } from '@app/participant/_services/focus-mode.service';
import {
  AnswerResultState,
  Content,
  ContentType,
  Questionnaire,
  QuestionnaireContentAnswerResultsByQuestionnaireIdGql,
  QuestionnairePublishedContentsByQuestionnaireIdGql,
  QuestionnairePublishingMode,
  QuestionnaireType,
  UserUiSettings,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { BehaviorSubject, NEVER, of } from 'rxjs';
import { QuestionnairePageComponent } from './questionnaire-page.component';

// Any result other than unanswered counts as answered.
const Answered = AnswerResultState.Neutral;
const Unanswered = AnswerResultState.Unanswered;

describe('QuestionnairePageComponent (auto-advance)', () => {
  let fixture: ComponentFixture<QuestionnairePageComponent>;
  let component: QuestionnairePageComponent;
  let results$: BehaviorSubject<unknown>;

  const contents = ['c-0', 'c-1', 'c-2', 'c-3', 'c-4'].map(
    (id, position) =>
      ({ id, position, formatData: { format: ContentType.Choice } }) as Content
  );

  function resultsResponse(results: AnswerResultState[]) {
    return {
      data: {
        questionnaireContentAnswerResultsByQuestionnaireId: results.map(
          (result, i) => ({ contentId: contents[i].id, result })
        ),
      },
    };
  }

  function spyProvider(token: Type<unknown>, methods: string[]) {
    return {
      provide: token,
      useValue: jasmine.createSpyObj(token.name, methods),
    };
  }

  function setUp(results: AnswerResultState[]) {
    // The page's child components are irrelevant to where answering leads.
    TestBed.overrideComponent(QuestionnairePageComponent, {
      set: { template: '', imports: [] },
    });
    const contentsGql = jasmine.createSpyObj('ContentsGql', ['watch']);
    contentsGql.watch.and.returnValue({
      valueChanges: of({
        data: {
          questionnairePublishedContentsByQuestionnaireId: {
            edges: contents.map((node) => ({ node })),
          },
        },
      }),
    });
    results$ = new BehaviorSubject<unknown>(resultsResponse(results));
    const answerResultsGql = jasmine.createSpyObj('AnswerResultsGql', [
      'watch',
    ]);
    answerResultsGql.watch.and.returnValue({ valueChanges: results$ });
    const focusModeService = jasmine.createSpyObj('FocusModeService', [
      'getFocusModeEnabled',
      'getContentState',
    ]);
    focusModeService.getFocusModeEnabled.and.returnValue(of(false));
    focusModeService.getContentState.and.returnValue(NEVER);
    const authenticationService = jasmine.createSpyObj(
      'AuthenticationService',
      ['getCurrentAuthentication']
    );
    authenticationService.getCurrentAuthentication.and.returnValue(
      of({ userId: 'user-1' })
    );
    const contentCarouselService = jasmine.createSpyObj(
      'ContentCarouselService',
      ['isLastContentAnswered']
    );
    contentCarouselService.isLastContentAnswered.and.returnValue(false);

    configureTestModule(
      [getTranslocoModule(), QuestionnairePageComponent],
      [
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } },
        { provide: AuthenticationService, useValue: authenticationService },
        { provide: ContentCarouselService, useValue: contentCarouselService },
        { provide: FocusModeService, useValue: focusModeService },
        {
          provide: QuestionnairePublishedContentsByQuestionnaireIdGql,
          useValue: contentsGql,
        },
        {
          provide: QuestionnaireContentAnswerResultsByQuestionnaireIdGql,
          useValue: answerResultsGql,
        },
        spyProvider(Router, ['navigate']),
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(QuestionnairePageComponent);
    component = fixture.componentInstance;
    spyOn(component, 'goToContent');
    spyOn(component, 'goToOverview');
    fixture.componentRef.setInput('questionnaire', {
      id: 'q-1',
      type: QuestionnaireType.Survey,
      publishingMode: QuestionnairePublishingMode.All,
      contentCount: contents.length,
    } as Questionnaire);
    fixture.componentRef.setInput('shortId', '12345678');
    fixture.componentRef.setInput('roomId', 'room-1');
    fixture.componentRef.setInput('settings', {} as UserUiSettings);
    fixture.componentRef.setInput('language', 'en');
    fixture.detectChanges();
    // Starting the stepper is deferred.
    tick();
  }

  function answer(results: AnswerResultState[]) {
    results$.next(resultsResponse(results));
    fixture.detectChanges();
    tick(1000);
  }

  it('advances to the next content after answering one before an answered last one', fakeAsync(() => {
    setUp([Unanswered, Unanswered, Unanswered, Unanswered, Answered]);

    answer([Answered, Unanswered, Unanswered, Unanswered, Answered]);

    expect(component.goToContent).toHaveBeenCalledOnceWith(1);
    expect(component.goToOverview).not.toHaveBeenCalled();
    flush();
  }));

  it('skips contents that have already been answered', fakeAsync(() => {
    setUp([Unanswered, Answered, Unanswered, Unanswered, Answered]);

    answer([Answered, Answered, Unanswered, Unanswered, Answered]);

    expect(component.goToContent).toHaveBeenCalledOnceWith(2);
    expect(component.goToOverview).not.toHaveBeenCalled();
    flush();
  }));

  it('opens the overview once no unanswered content follows', fakeAsync(() => {
    setUp([Answered, Answered, Answered, Unanswered, Answered]);

    answer([Answered, Answered, Answered, Answered, Answered]);

    expect(component.goToOverview).toHaveBeenCalledTimes(1);
    expect(component.goToContent).not.toHaveBeenCalled();
    flush();
  }));
});
