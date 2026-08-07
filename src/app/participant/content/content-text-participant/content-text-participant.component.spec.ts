import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import {
  AnswerResultState,
  ContentType,
  CreateQuestionnaireTextAnswerGql,
  TextContentFormatData,
} from '@gql/generated/graphql';
import { ContentTextParticipantComponent } from './content-text-participant.component';

const contentFormatData: TextContentFormatData = {
  __typename: 'TextContentFormatData',
  format: ContentType.Text,
  answersPublished: false,
};

describe('ContentTextParticipantComponent', () => {
  let fixture: ComponentFixture<ContentTextParticipantComponent>;
  let component: ContentTextParticipantComponent;
  let createAnswer: jasmine.SpyObj<CreateQuestionnaireTextAnswerGql>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    createAnswer = jasmine.createSpyObj('CreateQuestionnaireTextAnswerGql', [
      'mutate',
    ]);
    createAnswer.mutate.and.returnValue(
      of({
        data: {
          createQuestionnaireTextAnswer: {
            id: 'answer-1',
            result: AnswerResultState.Neutral,
            hidden: false,
          },
        },
      })
    );
    notificationService = jasmine.createSpyObj('NotificationService', [
      'showAdvanced',
    ]);

    const testBed = configureTestModule(
      [getTranslocoModule(), ContentTextParticipantComponent],
      [
        { provide: CreateQuestionnaireTextAnswerGql, useValue: createAnswer },
        { provide: NotificationService, useValue: notificationService },
      ]
    );
    await testBed.compileComponents();

    fixture = TestBed.createComponent(ContentTextParticipantComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('contentId', 'content-1');
    fixture.componentRef.setInput('roundId', 'round-1');
    fixture.componentRef.setInput('contentFormatData', contentFormatData);
    fixture.detectChanges();
  });

  it('does not submit an empty answer', () => {
    component.submitAnswer();
    expect(createAnswer.mutate).not.toHaveBeenCalled();
    expect(notificationService.showAdvanced).toHaveBeenCalledWith(
      jasmine.anything(),
      AdvancedSnackBarTypes.WARNING
    );
  });

  it('does not submit a whitespace-only answer', () => {
    component.answer.set('   ');
    component.submitAnswer();
    expect(createAnswer.mutate).not.toHaveBeenCalled();
  });

  it('submits the trimmed answer for the active round', () => {
    component.answer.set('  My answer  ');
    component.submitAnswer();
    expect(createAnswer.mutate).toHaveBeenCalledWith({
      variables: { roundId: 'round-1', body: 'My answer' },
    });
  });

  it('emits the created answer', () => {
    const emitted: string[] = [];
    component.answerCreated.subscribe((answer) => emitted.push(answer.id));
    component.answer.set('My answer');
    component.submitAnswer();
    expect(emitted).toEqual(['answer-1']);
  });

  it('seeds the answer from an already given answer', () => {
    fixture.componentRef.setInput('answerFormatData', {
      __typename: 'TextAnswerFormatData',
      format: ContentType.Text,
      body: 'Previously given',
    });
    fixture.detectChanges();
    expect(component.answer()).toBe('Previously given');
  });
});
