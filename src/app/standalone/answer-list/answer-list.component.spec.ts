import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { AnswerListComponent } from './answer-list.component';
import { TextStatistic } from '@app/core/models/text-statistic';
import { configureTestModule } from '@testing/test.setup';

describe('AnswerListComponent', () => {
  let component: AnswerListComponent;
  let fixture: ComponentFixture<AnswerListComponent>;

  function setUp(inputs: Partial<AnswerListComponent> = {}) {
    configureTestModule([
      getTranslocoModule(),
      AnswerListComponent,
    ]).compileComponents();
    fixture = TestBed.createComponent(AnswerListComponent);
    component = fixture.componentInstance;
    component.answers = [
      new TextStatistic('ABC', 3),
      new TextStatistic('GHI', 5),
      new TextStatistic('DEF', 5),
      new TextStatistic('JKL', 7),
      new TextStatistic('MNO', 1),
      new TextStatistic('PQR', 5),
    ];
    Object.assign(component, inputs);
    fixture.detectChanges();
  }

  function rows(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.list-item'));
  }

  function row(answer: string): HTMLElement {
    return rows().find(
      (r) => r.querySelector('.answer')?.textContent?.trim() === answer
    )!;
  }

  it('lists the most frequent answers first, equal counts alphabetically', () => {
    setUp();

    expect(
      rows().map((r) => r.querySelector('.answer')?.textContent?.trim())
    ).toEqual(['JKL', 'DEF', 'GHI', 'PQR', 'ABC', 'MNO']);
  });

  it('shows the count of an answer given more than once', () => {
    setUp();

    expect(row('JKL').textContent).toContain('x 7');
    expect(row('MNO').textContent).not.toContain('x 1');
  });

  it('lets a moderator ban an answer', () => {
    setUp();
    const deleted: string[] = [];
    component.deleteClicked.subscribe((a) => deleted.push(a.answer));

    row('ABC').querySelector<HTMLButtonElement>('.delete-button')!.click();

    expect(deleted).toEqual(['ABC']);
  });

  it('offers no banning in the presentation or to participants', () => {
    for (const inputs of [{ isPresentation: true }, { isModerator: false }]) {
      setUp(inputs);

      expect(fixture.nativeElement.querySelector('.delete-button'))
        .withContext(JSON.stringify(inputs))
        .toBeNull();
      TestBed.resetTestingModule();
    }
  });

  it('never offers to ban a correct answer', () => {
    setUp({ correctAnswers: ['ABC'] });

    expect(row('ABC').querySelector('.delete-button')).toBeNull();
    expect(row('DEF').querySelector('.delete-button')).not.toBeNull();
  });

  it('marks the correct answers only once they are revealed', () => {
    setUp({ correctAnswers: ['ABC'] });
    const icon = () => row('ABC').querySelector('.correct-icon')!;
    expect(icon().classList).not.toContain('show-correct-icon');

    component.showCorrect = true;
    fixture.detectChanges();

    expect(icon().classList).toContain('show-correct-icon');
    expect(row('DEF').querySelector('.correct-icon')!.classList).not.toContain(
      'show-correct-icon'
    );
  });
});
