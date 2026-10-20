import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import { ContentTextAnswerComponent } from './content-text-answer.component';

describe('ContentTextAnswerComponent', () => {
  let component: ContentTextAnswerComponent;
  let fixture: ComponentFixture<ContentTextAnswerComponent>;

  beforeEach(async () => {
    const testBed = configureTestModule([
      getTranslocoModule(),
      ContentTextAnswerComponent,
    ]);
    await testBed.compileComponents();
    fixture = testBed.createComponent(ContentTextAnswerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function textarea(): HTMLTextAreaElement {
    return fixture.debugElement.query(By.css('textarea')).nativeElement;
  }

  it('starts with an empty answer', () => {
    expect(component.answer()).toBe('');
  });

  it('writes the model value into the textarea', async () => {
    fixture.componentRef.setInput('answer', 'A given answer');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(textarea().value).toBe('A given answer');
  });

  it('updates the model when the textarea changes', async () => {
    const element = textarea();
    element.value = 'Typed by a participant';
    element.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.answer()).toBe('Typed by a participant');
  });

  it('renders a single-line input when minRows is 1', () => {
    fixture.componentRef.setInput('minRows', 1);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('textarea'))).toBeNull();
    expect(fixture.debugElement.query(By.css('input'))).not.toBeNull();
  });

  it('applies the length limit to the textarea', () => {
    fixture.componentRef.setInput('lengthLimit', 42);
    fixture.detectChanges();
    expect(textarea().maxLength).toBe(42);
  });

  function formField(): HTMLElement {
    return fixture.debugElement.query(By.css('mat-form-field')).nativeElement;
  }

  it('stays neutral while no correctness is given', () => {
    expect(fixture.debugElement.query(By.css('mat-icon'))).toBeNull();
    expect(formField().classList).not.toContain('correct');
    expect(formField().classList).not.toContain('wrong');
  });

  it('marks itself correct and suffixes a check icon', () => {
    fixture.componentRef.setInput('correct', true);
    fixture.detectChanges();
    expect(formField().classList).toContain('correct');
    expect(
      fixture.debugElement.query(By.css('[data-testid="text-answer-correct"]'))
        .nativeElement.textContent
    ).toBe('check');
  });

  it('marks itself wrong and suffixes a close icon', () => {
    fixture.componentRef.setInput('correct', false);
    fixture.detectChanges();
    expect(formField().classList).toContain('wrong');
    expect(
      fixture.debugElement.query(By.css('[data-testid="text-answer-wrong"]'))
        .nativeElement.textContent
    ).toBe('close');
  });
});
