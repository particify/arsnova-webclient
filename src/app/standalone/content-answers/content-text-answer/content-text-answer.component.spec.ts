import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTranslocoModule } from '@testing/transloco-testing.module';

import { ContentTextAnswerComponent } from './content-text-answer.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ContentTextAnswerComponent', () => {
  let component: ContentTextAnswerComponent;
  let fixture: ComponentFixture<ContentTextAnswerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ContentTextAnswerComponent,
        BrowserAnimationsModule,
        getTranslocoModule(),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentTextAnswerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
