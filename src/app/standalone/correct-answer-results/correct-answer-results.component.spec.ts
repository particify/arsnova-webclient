import { ComponentFixture, TestBed } from '@angular/core/testing';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { CorrectAnswerResultsComponent } from './correct-answer-results.component';

describe('CorrectAnswerResultsComponent', () => {
  let fixture: ComponentFixture<CorrectAnswerResultsComponent>;
  let component: CorrectAnswerResultsComponent;

  function setUp(inputs: Record<string, unknown>) {
    configureTestModule([
      getTranslocoModule(),
      CorrectAnswerResultsComponent,
    ]).compileComponents();
    fixture = TestBed.createComponent(CorrectAnswerResultsComponent);
    component = fixture.componentInstance;
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  }

  function text(): string {
    return fixture.nativeElement.textContent.replace(/\s+/g, ' ').trim();
  }

  it('relates the correct answers to all responses, abstentions included', () => {
    setUp({ answerCount: 6, correctAnswerCount: 3, abstentionCount: 2 });

    expect(component.correctPercentage()).toBe('38 %');
    expect(component.abstentionPercentage()).toBe('25 %');
  });

  it('shows 0 % without any answers', () => {
    setUp({ abstentionCount: 2 });

    expect(component.correctPercentage()).toBe('0 %');
  });

  it('mentions abstentions only when there are some', () => {
    setUp({ answerCount: 4, correctAnswerCount: 1 });

    expect(component.abstentionPercentage()).toBeUndefined();
    expect(text()).not.toContain('answer.have-abstained');
  });

  it('reveals the results only when asked to', () => {
    setUp({ answerCount: 4, correctAnswerCount: 1 });
    const container = () =>
      fixture.nativeElement.querySelector('.correct-info-container');
    expect(container().classList).not.toContain('show-container');

    fixture.componentRef.setInput('show', true);
    fixture.detectChanges();

    expect(container().classList).toContain('show-container');
  });
});
