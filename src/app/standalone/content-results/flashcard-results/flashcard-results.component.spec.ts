import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import {
  ContentType,
  FlashcardContentFormatData,
} from '@gql/generated/graphql';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { FlashcardResultsComponent } from './flashcard-results.component';

function formatData(answer: string): FlashcardContentFormatData {
  return {
    __typename: 'FlashcardContentFormatData',
    format: ContentType.Flashcard,
    answer,
  };
}

describe('FlashcardResultsComponent', () => {
  let fixture: ComponentFixture<FlashcardResultsComponent>;

  function setUp(data: FlashcardContentFormatData) {
    const formattingService = jasmine.createSpyObj('FormattingService', [
      'postString',
    ]);
    formattingService.postString.and.returnValue(of({ html: data.answer }));

    configureTestModule(
      [getTranslocoModule(), FlashcardResultsComponent],
      [{ provide: FormattingService, useValue: formattingService }]
    ).compileComponents();

    fixture = TestBed.createComponent(FlashcardResultsComponent);
    fixture.componentRef.setInput('formatData', data);
    fixture.detectChanges();
  }

  it('renders the answer text', () => {
    setUp(formatData('The answer'));
    const renderedText = fixture.debugElement.query(
      By.directive(RenderedTextComponent)
    ).componentInstance as RenderedTextComponent;
    expect(renderedText.rawText).toBe('The answer');
  });

  it('shows the back side with the inputs the results outlet passes', () => {
    setUp(formatData('The answer'));

    fixture.componentRef.setInput('roundIds', ['round-1']);
    fixture.componentRef.setInput('resultsVisible', true);
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).textContent?.trim()
    ).toContain('The answer');
  });
});
