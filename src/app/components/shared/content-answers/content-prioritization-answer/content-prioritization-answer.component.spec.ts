import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JsonTranslationLoader } from '@arsnova/testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { ContentPrioritizationAnswerComponent } from './content-prioritization-answer.component';

describe('ContentPrioritizationAnswerComponent', () => {
  let component: ContentPrioritizationAnswerComponent;
  let fixture: ComponentFixture<ContentPrioritizationAnswerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContentPrioritizationAnswerComponent ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader
          },
          isolate: true
        })
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    })
    .compileComponents();

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
