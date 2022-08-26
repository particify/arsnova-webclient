import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentWordcloudAnswerComponent } from './content-wordcloud-answer.component';

describe('ContentWordcloudAnswerComponent', () => {
  let component: ContentWordcloudAnswerComponent;
  let fixture: ComponentFixture<ContentWordcloudAnswerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContentWordcloudAnswerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentWordcloudAnswerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
