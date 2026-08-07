import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import { TextAnswerListComponent } from './text-answer-list.component';
import { TextAnswerItem } from './text-answer-item';

const answers: TextAnswerItem[] = [
  { id: 'a-1', body: 'The first answer' },
  { id: 'a-2', body: 'The second answer' },
  { id: 'a-3', body: 'The first answer' },
];

describe('TextAnswerListComponent', () => {
  let fixture: ComponentFixture<TextAnswerListComponent>;

  function setUp(hidingAllowed: boolean) {
    const testBed = configureTestModule([
      getTranslocoModule(),
      TextAnswerListComponent,
    ]);
    testBed.compileComponents();
    fixture = TestBed.createComponent(TextAnswerListComponent);
    fixture.componentRef.setInput('answers', answers);
    fixture.componentRef.setInput('hidingAllowed', hidingAllowed);
    fixture.detectChanges();
  }

  function items() {
    return fixture.debugElement.queryAll(
      By.css('[data-testid="text-answer-item"]')
    );
  }

  it('renders one row per answer without aggregating identical bodies', () => {
    setUp(false);
    expect(items().length).toBe(3);
    expect(
      items().map((i) => i.query(By.css('.answer')).nativeElement.textContent)
    ).toEqual(['The first answer', 'The second answer', 'The first answer']);
  });

  it('offers no hide button when hiding is not allowed', () => {
    setUp(false);
    expect(fixture.debugElement.queryAll(By.css('button')).length).toBe(0);
  });

  it('emits the answer of the clicked hide button', () => {
    setUp(true);
    const emitted: TextAnswerItem[] = [];
    fixture.componentInstance.hideClicked.subscribe((a) => emitted.push(a));
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    expect(buttons.length).toBe(3);
    buttons[2].nativeElement.click();
    expect(emitted).toEqual([answers[2]]);
  });
});
