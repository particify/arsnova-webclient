import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JsonTranslationLoader } from '@arsnova/testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { CreateAnswerOptionComponent } from './create-answer-option.component';

describe('CreateAnswerOptionComponent', () => {
  let component: CreateAnswerOptionComponent;
  let fixture: ComponentFixture<CreateAnswerOptionComponent>;

  const mockResetEvent = new EventEmitter<boolean>();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateAnswerOptionComponent],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateAnswerOptionComponent);
    component = fixture.componentInstance;
    component.resetEvent = mockResetEvent;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
