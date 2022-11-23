import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JsonTranslationLoader } from '@arsnova/testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { ContentPriorizationAnswerComponent } from './content-priorization-answer.component';

describe('ContentPriorizationAnswerComponent', () => {
  let component: ContentPriorizationAnswerComponent;
  let fixture: ComponentFixture<ContentPriorizationAnswerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContentPriorizationAnswerComponent ],
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

    fixture = TestBed.createComponent(ContentPriorizationAnswerComponent);
    component = fixture.componentInstance;
    component.answerOptions = [];
    component.assignablePoints = 100;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
