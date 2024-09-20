import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorrectAnswerResultsComponent } from './correct-answer-results.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';

describe('CorrectAnswerResultsComponent', () => {
  let component: CorrectAnswerResultsComponent;
  let fixture: ComponentFixture<CorrectAnswerResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CorrectAnswerResultsComponent, getTranslocoModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(CorrectAnswerResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
