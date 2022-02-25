import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AnswerCountComponent } from './answer-count.component';
import { JsonTranslationLoader, MockEventService } from '@arsnova/testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { EventService } from '@arsnova/app/services/util/event.service';

describe('AnswerCountComponent', () => {
  let component: AnswerCountComponent;
  let fixture: ComponentFixture<AnswerCountComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        AnswerCountComponent
      ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader
          },
          isolate: true
        })
      ],
      providers: [
        {
          provide: EventService,
          useClass: MockEventService
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswerCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
