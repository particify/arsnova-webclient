import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentChoiceAnswerComponent } from 'app/components/shared/content-answers/content-choice-answer/content-choice-answer.component';

describe('ContentChoiceAnswerComponent', () => {
  let component: ContentChoiceAnswerComponent;
  let fixture: ComponentFixture<ContentChoiceAnswerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContentChoiceAnswerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentChoiceAnswerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
