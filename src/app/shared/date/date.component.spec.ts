import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateFormatPipe } from '@app/core/pipes/date-format.pipe';
import { DateFromNowPipe } from '@app/core/pipes/date-from-now.pipe';
import { JsonTranslationLoader } from '@testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { DateComponent } from './date.component';

describe('DateComponent', () => {
  let component: DateComponent;
  let fixture: ComponentFixture<DateComponent>;

  const dateFromNowPipeStub = new DateFromNowPipe();
  const dateFormatPipeStub = new DateFormatPipe();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DateComponent, DateFromNowPipe, DateFormatPipe],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
      ],
      providers: [
        {
          provide: DateFromNowPipe,
          useValue: dateFromNowPipeStub,
        },
        {
          provide: DateFormatPipe,
          useValue: dateFormatPipeStub,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
