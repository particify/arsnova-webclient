import { ComponentFixture, TestBed } from '@angular/core/testing';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { ContentNumericAnswerComponent } from './content-numeric-answer.component';

describe('ContentNumericAnswerComponent', () => {
  let fixture: ComponentFixture<ContentNumericAnswerComponent>;
  let component: ContentNumericAnswerComponent;

  function setUp(inputs: Record<string, unknown> = {}) {
    configureTestModule([
      getTranslocoModule(),
      ContentNumericAnswerComponent,
    ]).compileComponents();
    fixture = TestBed.createComponent(ContentNumericAnswerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('minNumber', 0);
    fixture.componentRef.setInput('maxNumber', 100);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  }

  const published = {
    answered: true,
    correctOptionsPublished: true,
    correctNumber: 42,
    tolerance: 2,
  };

  it('counts an answer within the tolerance as correct, bounds included', () => {
    for (const selectedNumber of [40, 42, 44]) {
      TestBed.resetTestingModule();
      setUp({ ...published, selectedNumber });
      expect(component.correct()).withContext(`${selectedNumber}`).toBeTrue();
    }
  });

  it('counts an answer outside the tolerance as wrong', () => {
    setUp({ ...published, selectedNumber: 45 });

    expect(component.correct()).toBeFalse();
  });

  it('shows the correct answer once it is published', () => {
    setUp({ ...published, selectedNumber: 45 });

    expect(component.answerIndicatorVisible()).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain(
      'answer.correct-answer-is'
    );
  });

  it('shows no verdict while the correct answer is withheld', () => {
    setUp({ ...published, correctNumber: null, selectedNumber: 45 });

    expect(component.answerIndicatorVisible()).toBeFalse();
    expect(fixture.nativeElement.textContent).not.toContain(
      'answer.correct-answer-is'
    );
  });

  it('shows no verdict before the answer is given', () => {
    setUp({ ...published, answered: false, selectedNumber: 45 });

    expect(component.answerIndicatorVisible()).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain(
      'answer.select-a-number-between'
    );
  });
});
