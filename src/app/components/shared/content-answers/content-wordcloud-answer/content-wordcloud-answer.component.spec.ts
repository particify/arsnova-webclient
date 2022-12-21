import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentWordcloudAnswerComponent } from './content-wordcloud-answer.component';

describe('ContentWordcloudAnswerComponent', () => {
  let component: ContentWordcloudAnswerComponent;
  let fixture: ComponentFixture<ContentWordcloudAnswerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContentWordcloudAnswerComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentWordcloudAnswerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
