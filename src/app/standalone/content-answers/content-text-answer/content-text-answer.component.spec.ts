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
});
