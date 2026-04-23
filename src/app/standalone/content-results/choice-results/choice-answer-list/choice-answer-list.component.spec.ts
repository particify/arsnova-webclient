import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { configureTestModule } from '@testing/test.setup';
import { ChoiceAnswerItem } from './choice-answer-item';
import { ChoiceAnswerListComponent } from './choice-answer-list.component';

describe('ChoiceAnswerListComponent', () => {
  let fixture: ComponentFixture<ChoiceAnswerListComponent>;

  function setUp(
    answers: ChoiceAnswerItem[],
    inputs: Record<string, unknown> = {}
  ) {
    configureTestModule(
      [ChoiceAnswerListComponent],
      [
        {
          provide: FormattingService,
          useValue: jasmine.createSpyObj('FormattingService', ['postString']),
        },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(ChoiceAnswerListComponent);
    fixture.componentRef.setInput('answers', answers);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  }

  function answerTexts(): HTMLElement[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll('app-rendered-text')
    );
  }

  it('shows the rendered label of an option', () => {
    setUp([
      {
        labelLetter: 'A',
        label: '**A**',
        labelRendered: '<p><strong>A</strong></p>',
        count: 0,
        isCorrect: false,
      },
    ]);

    expect(answerTexts()[0].querySelector('strong')?.textContent).toBe('A');
  });

  it('falls back to the raw label without a rendered one', () => {
    setUp([{ labelLetter: 'A', label: 'A', count: 0, isCorrect: false }]);

    expect(answerTexts()[0].textContent?.trim()).toBe('A');
  });

  const answers: ChoiceAnswerItem[] = [
    { labelLetter: 'A', label: 'A', count: 0, isCorrect: true },
    { labelLetter: 'B', label: 'B', count: 0, isCorrect: false },
  ];

  function correctIcons(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.correct-icon'));
  }

  it('hides the correct-answer marks until they are revealed', () => {
    setUp(answers, { hasCorrectAnswer: true });

    expect(correctIcons().map((i) => getComputedStyle(i).opacity)).toEqual([
      '0',
      '0',
    ]);
  });

  it('marks only the correct option on reveal', () => {
    setUp(answers, { hasCorrectAnswer: true, showCorrect: true });

    const items = fixture.nativeElement.querySelectorAll('.answer-item');
    expect(items[0].classList).toContain('correct');
    expect(items[1].classList).not.toContain('correct');
    expect(
      correctIcons().map((i) => i.classList.contains('show-correct-icon'))
    ).toEqual([true, false]);
  });

  it('greys out wrong labels below the chart on reveal', () => {
    setUp(answers, {
      hasCorrectAnswer: true,
      showCorrect: true,
      presentationMode: true,
      contentAnswersDirectlyBelowChart: true,
      answerLabelWidth: '120px',
    });

    const labels: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.chart-answer-label')
    );
    expect(labels.map((l) => l.classList.contains('not-correct'))).toEqual([
      false,
      true,
    ]);
    expect(labels[0].style.width).toBe('120px');
  });
});
