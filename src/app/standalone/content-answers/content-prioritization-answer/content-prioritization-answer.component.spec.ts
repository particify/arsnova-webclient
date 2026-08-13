import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { ContentPrioritizationAnswerComponent } from './content-prioritization-answer.component';

const ASSIGNABLE_POINTS = 60;

describe('ContentPrioritizationAnswerComponent', () => {
  let fixture: ComponentFixture<ContentPrioritizationAnswerComponent>;
  let component: ContentPrioritizationAnswerComponent;

  function setUp(labels = ['A', 'B', 'C'], assignedPoints = [0, 0, 0]) {
    configureTestModule(
      [getTranslocoModule(), ContentPrioritizationAnswerComponent],
      [
        {
          provide: FormattingService,
          useValue: { postString: () => of({ html: '' }) },
        },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(ContentPrioritizationAnswerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput(
      'answerOptions',
      labels.map((label) => ({ label }))
    );
    fixture.componentRef.setInput('assignablePoints', ASSIGNABLE_POINTS);
    fixture.componentRef.setInput('assignedPoints', assignedPoints);
    fixture.detectChanges();
  }

  function rows(): HTMLElement[] {
    return fixture.debugElement
      .queryAll(By.css('[role="listitem"]'))
      .map((element) => element.nativeElement);
  }

  function inputs(): HTMLInputElement[] {
    return fixture.debugElement
      .queryAll(By.css('input'))
      .map((element) => element.nativeElement);
  }

  function buttons(index: number): HTMLButtonElement[] {
    return fixture.debugElement
      .queryAll(By.css('button'))
      .map((element) => element.nativeElement as HTMLButtonElement)
      .slice(index * 2, index * 2 + 2);
  }

  function type(index: number, value: string) {
    const input = inputs()[index];
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  function labels(): string[] {
    return fixture.debugElement
      .queryAll(By.css('app-rendered-text'))
      .map((element) => (element.nativeElement.textContent ?? '').trim());
  }

  function summary(): string {
    return (
      fixture.debugElement.query(By.css('[data-testid="points-summary"]'))
        ?.nativeElement.textContent ?? ''
    );
  }

  it('renders one row per item, showing its label', () => {
    setUp();
    expect(rows().length).toBe(3);
    expect(labels()).toEqual(['A', 'B', 'C']);
  });

  it('starts every item at no points, with the whole budget left', () => {
    setUp();
    expect(inputs().map((input) => input.value)).toEqual(['0', '0', '0']);
    expect(component.pointsLeft()).toBe(ASSIGNABLE_POINTS);
  });

  it('shows the points a given answer assigned', () => {
    setUp(['A', 'B', 'C'], [30, 20, 10]);
    expect(inputs().map((input) => input.value)).toEqual(['30', '20', '10']);
    expect(component.pointsLeft()).toBe(0);
  });

  it('adds and removes ten points at a time', () => {
    setUp();
    component.step(1, 1);
    fixture.detectChanges();
    expect(component.assignedPoints()).toEqual([0, 10, 0]);
    component.step(1, 1);
    component.step(1, -1);
    fixture.detectChanges();
    expect(component.assignedPoints()).toEqual([0, 10, 0]);
    expect(component.pointsLeft()).toBe(ASSIGNABLE_POINTS - 10);
  });

  it('stops removing at zero', () => {
    setUp(['A', 'B', 'C'], [10, 0, 0]);
    expect(buttons(0)[0].disabled).toBe(false);
    expect(buttons(1)[0].disabled).toBe(true);
  });

  it('stops adding once less than a step of the budget is left', () => {
    setUp(['A', 'B', 'C'], [ASSIGNABLE_POINTS - 10, 0, 0]);
    expect(buttons(0)[1].disabled).toBe(false);

    component.step(1, 1);
    fixture.detectChanges();

    expect(component.pointsLeft()).toBe(0);
    expect(buttons(0)[1].disabled).toBe(true);
    expect(buttons(2)[1].disabled).toBe(true);
  });

  it('takes points typed straight into the field', () => {
    setUp();
    type(2, '25');
    expect(component.assignedPoints()).toEqual([0, 0, 25]);
    expect(component.pointsLeft()).toBe(ASSIGNABLE_POINTS - 25);
  });

  it('treats a cleared field as no points', () => {
    setUp(['A', 'B', 'C'], [30, 0, 0]);
    type(0, '');
    expect(component.assignedPoints()).toEqual([0, 0, 0]);
  });

  it('keeps only whole points', () => {
    setUp();
    type(0, '12.5');
    expect(component.assignedPoints()).toEqual([12, 0, 0]);
  });

  it('keeps a typed value beyond the budget for the submit to reject', () => {
    setUp();
    type(0, String(ASSIGNABLE_POINTS + 40));
    expect(component.assignedPoints()).toEqual([ASSIGNABLE_POINTS + 40, 0, 0]);
  });

  it('reports how many points are left', () => {
    setUp(['A', 'B', 'C'], [10, 0, 0]);
    expect(summary()).toContain(String(ASSIGNABLE_POINTS - 10));
    expect(summary()).toContain('answer.points-left');
  });

  it('reports how many points were assigned too many', () => {
    setUp(['A', 'B', 'C'], [ASSIGNABLE_POINTS + 5, 0, 0]);
    expect(summary()).toContain('5');
    expect(summary()).toContain('answer.points-too-much');
  });

  it('hides the summary and locks every control while disabled', () => {
    setUp(['A', 'B', 'C'], [30, 20, 10]);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(summary()).toBe('');
    expect(inputs().every((input) => input.disabled)).toBe(true);
    expect(
      fixture.debugElement
        .queryAll(By.css('button'))
        .every((button) => button.nativeElement.disabled)
    ).toBe(true);
  });

  it('fills in an entry for an item the given points did not cover', () => {
    setUp(['A', 'B', 'C'], []);
    component.step(2, 1);
    expect(component.assignedPoints()).toEqual([0, 0, 10]);
  });
});
