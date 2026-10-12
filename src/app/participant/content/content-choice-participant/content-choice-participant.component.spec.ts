import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationService } from '@app/core/services/util/notification.service';
import { By } from '@angular/platform-browser';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { BROWSER_LANG } from '@app/core/services/util/language.service';
import { ContentChoiceAnswerComponent } from '@app/standalone/content-answers/content-choice-answer/content-choice-answer.component';
import {
  AnswerResultState,
  ContentType,
  CreateQuestionnaireChoiceAnswerGql,
} from '@gql/generated/graphql';
import { of } from 'rxjs';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { ContentChoiceParticipantComponent } from './content-choice-participant.component';

describe('ContentChoiceParticipantComponent', () => {
  let fixture: ComponentFixture<ContentChoiceParticipantComponent>;

  it('keeps the rendered label of each option', () => {
    TestBed.overrideComponent(ContentChoiceParticipantComponent, {
      set: { template: '' },
    });
    configureTestModule(
      [getTranslocoModule(), ContentChoiceParticipantComponent],
      [
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', [
            'showAdvanced',
          ]),
        },
      ]
    ).compileComponents();
    fixture = TestBed.createComponent(ContentChoiceParticipantComponent);
    fixture.componentRef.setInput('contentId', 'content-1');
    fixture.componentRef.setInput('contentFormatData', {
      format: ContentType.Choice,
      options: [{ label: '**A**', labelRendered: '<p><b>A</b></p>' }],
    });
    fixture.detectChanges();

    expect(fixture.componentInstance.answerOptions()[0].answerOption).toEqual({
      label: '**A**',
      renderedLabel: '<p><b>A</b></p>',
    });
  });

  describe('submitting', () => {
    let createAnswer: jasmine.SpyObj<CreateQuestionnaireChoiceAnswerGql>;
    let notificationService: jasmine.SpyObj<NotificationService>;

    beforeEach(() => {
      createAnswer = jasmine.createSpyObj(
        'CreateQuestionnaireChoiceAnswerGql',
        ['mutate']
      );
      createAnswer.mutate.and.returnValue(of({ data: {} }) as never);
      notificationService = jasmine.createSpyObj('NotificationService', [
        'showAdvanced',
      ]);
      TestBed.overrideComponent(ContentChoiceParticipantComponent, {
        set: { template: '' },
      });
      configureTestModule(
        [getTranslocoModule(), ContentChoiceParticipantComponent],
        [
          { provide: NotificationService, useValue: notificationService },
          {
            provide: CreateQuestionnaireChoiceAnswerGql,
            useValue: createAnswer,
          },
        ]
      ).compileComponents();
      fixture = TestBed.createComponent(ContentChoiceParticipantComponent);
      fixture.componentRef.setInput('contentId', 'content-1');
      fixture.componentRef.setInput('roundId', 'round-1');
      fixture.componentRef.setInput('contentFormatData', {
        format: ContentType.Choice,
        options: [{ label: 'A' }, { label: 'B' }],
      });
      fixture.detectChanges();
    });

    it('rejects an answer without a selected option', () => {
      fixture.componentInstance.submitAnswer();

      expect(createAnswer.mutate).not.toHaveBeenCalled();
      expect(notificationService.showAdvanced).toHaveBeenCalled();
    });

    it('sends the selected option indexes', () => {
      fixture.componentInstance.answerOptions()[1].checked = true;

      fixture.componentInstance.submitAnswer();

      expect(createAnswer.mutate).toHaveBeenCalledWith({
        variables: {
          input: { roundId: 'round-1', selectedChoiceIndexes: [1] },
        },
      });
    });
  });

  describe('correct option', () => {
    function answeredInput(result: AnswerResultState): boolean {
      configureTestModule(
        [getTranslocoModule(), ContentChoiceParticipantComponent],
        [
          {
            provide: NotificationService,
            useValue: jasmine.createSpyObj('NotificationService', [
              'showAdvanced',
            ]),
          },
          {
            provide: FormattingService,
            useValue: { postString: () => of('') },
          },
          { provide: BROWSER_LANG, useValue: 'en' },
        ]
      ).compileComponents();
      fixture = TestBed.createComponent(ContentChoiceParticipantComponent);
      fixture.componentRef.setInput('contentId', 'content-1');
      fixture.componentRef.setInput('contentFormatData', {
        format: ContentType.Choice,
        options: [{ label: 'A' }, { label: 'B' }],
        correctOptionIndexes: [1],
      });
      fixture.componentRef.setInput('correctOptionsPublished', true);
      fixture.componentRef.setInput('result', result);
      fixture.detectChanges();
      return fixture.debugElement
        .query(By.directive(ContentChoiceAnswerComponent))
        .componentInstance.answered();
    }

    it('is revealed to a participant who answered', () => {
      expect(answeredInput(AnswerResultState.Wrong)).toBeTrue();
    });

    it('is not revealed to a participant who abstained', () => {
      expect(answeredInput(AnswerResultState.Abstained)).toBeFalse();
    });
  });
});
