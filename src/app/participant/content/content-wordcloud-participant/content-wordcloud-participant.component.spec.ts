import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CombinedGraphQLErrors } from '@apollo/client';
import { NotificationService } from '@app/core/services/util/notification.service';
import {
  AnswerResultState,
  ContentType,
  CreateQuestionnaireWordcloudAnswerGql,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { of, throwError } from 'rxjs';
import { ContentWordcloudAnswerComponent } from '@app/standalone/content-answers/content-wordcloud-answer/content-wordcloud-answer.component';
import { By } from '@angular/platform-browser';
import { ContentWordcloudParticipantComponent } from './content-wordcloud-participant.component';

describe('ContentWordcloudParticipantComponent', () => {
  let fixture: ComponentFixture<ContentWordcloudParticipantComponent>;
  let component: ContentWordcloudParticipantComponent;
  let createAnswer: jasmine.SpyObj<CreateQuestionnaireWordcloudAnswerGql>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  function setUp(keepTemplate = false) {
    // Submitting is tested here; the input fields have their own specs.
    if (keepTemplate) {
      TestBed.overrideComponent(ContentWordcloudAnswerComponent, {
        set: { template: '', imports: [] },
      });
    } else {
      TestBed.overrideComponent(ContentWordcloudParticipantComponent, {
        set: { template: '', imports: [] },
      });
    }
    createAnswer = jasmine.createSpyObj(
      'CreateQuestionnaireWordcloudAnswerGql',
      ['mutate']
    );
    createAnswer.mutate.and.returnValue(
      of({
        data: {
          createQuestionnaireWordcloudAnswer: {
            id: 'answer-1',
            result: AnswerResultState.Neutral,
          },
        },
      }) as never
    );
    notificationService = jasmine.createSpyObj('NotificationService', [
      'showAdvanced',
      'showOnRequestClientError',
    ]);

    configureTestModule(
      [getTranslocoModule(), ContentWordcloudParticipantComponent],
      [
        {
          provide: CreateQuestionnaireWordcloudAnswerGql,
          useValue: createAnswer,
        },
        { provide: NotificationService, useValue: notificationService },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(ContentWordcloudParticipantComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('contentId', 'content-1');
    fixture.componentRef.setInput('roundId', 'round-1');
    fixture.componentRef.setInput('contentFormatData', {
      format: ContentType.Wordcloud,
      maxAnswers: 3,
    });
    fixture.detectChanges();
  }

  it('offers one empty field per allowed word', () => {
    setUp();

    expect(component.words()).toEqual(['', '', '']);
  });

  it('sends only the entered words, trimmed', () => {
    setUp();
    component.words.set([' Angular ', '', '   ']);

    component.submitAnswer();

    expect(createAnswer.mutate).toHaveBeenCalledWith({
      variables: { input: { roundId: 'round-1', words: ['Angular'] } },
    });
  });

  it('asks for an answer instead of sending blank words', () => {
    setUp();
    component.words.set(['', '  ', '']);

    component.submitAnswer();

    expect(createAnswer.mutate).not.toHaveBeenCalled();
    expect(notificationService.showAdvanced).toHaveBeenCalled();
  });

  it('hands the created answer on', () => {
    setUp();
    const created = jasmine.createSpy('answerCreated');
    component.answerCreated.subscribe(created);
    component.words.set(['Angular', '', '']);

    component.submitAnswer();

    expect(created).toHaveBeenCalledWith(
      jasmine.objectContaining({ id: 'answer-1' })
    );
  });

  it('reports a rejected answer', () => {
    setUp();
    createAnswer.mutate.and.returnValue(
      throwError(
        () =>
          new CombinedGraphQLErrors({
            errors: [
              {
                message: 'rejected',
                extensions: { classification: 'BAD_REQUEST' },
              },
            ],
          })
      ) as never
    );
    component.words.set(['Angular', '', '']);

    component.submitAnswer();

    expect(notificationService.showOnRequestClientError).toHaveBeenCalled();
  });

  describe('its input fields', () => {
    function fields(): ContentWordcloudAnswerComponent {
      return fixture.debugElement.query(
        By.directive(ContentWordcloudAnswerComponent)
      ).componentInstance;
    }

    it('stay editable while answering is open', () => {
      setUp(true);

      expect(fields().disabled()).toBeFalse();
    });

    it('lock without an own wordcloud answer', () => {
      setUp(true);
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      expect(fields().disabled()).toBeTrue();
    });
  });
});
