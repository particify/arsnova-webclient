import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationService } from '@app/core/services/util/notification.service';
import { By } from '@angular/platform-browser';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { BROWSER_LANG } from '@app/core/services/util/language.service';
import { ContentChoiceAnswerComponent } from '@app/standalone/content-answers/content-choice-answer/content-choice-answer.component';
import { AnswerResultState, ContentType } from '@gql/generated/graphql';
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
