import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentSortAnswerComponent } from 'app/components/shared/content-answers/content-sort-answer/content-sort-answer.component';

describe('ContentSortAnswerComponent', () => {
  let component: ContentSortAnswerComponent;
  let fixture: ComponentFixture<ContentSortAnswerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContentSortAnswerComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentSortAnswerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
