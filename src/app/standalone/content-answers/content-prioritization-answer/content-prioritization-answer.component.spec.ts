import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTranslocoModule } from '@testing/transloco-testing.module';

import { ContentPrioritizationAnswerComponent } from './content-prioritization-answer.component';

describe('ContentPrioritizationAnswerComponent', () => {
  let component: ContentPrioritizationAnswerComponent;
  let fixture: ComponentFixture<ContentPrioritizationAnswerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentPrioritizationAnswerComponent, getTranslocoModule()],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentPrioritizationAnswerComponent);
    component = fixture.componentInstance;
    component.answerOptions = [];
    component.assignablePoints = 100;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
