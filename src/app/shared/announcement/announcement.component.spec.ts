import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LanguageService } from '@core/services/util/language.service';
import { DateFormatPipe } from '@core/pipes/date-format.pipe';
import { JsonTranslationLoader, MockLangService } from '@testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { AnnouncementComponent } from './announcement.component';
import { UserAnnouncement } from '@core/models/user-announcement';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AnnouncementComponent', () => {
  let component: AnnouncementComponent;
  let fixture: ComponentFixture<AnnouncementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnnouncementComponent, DateFormatPipe],
      providers: [
        {
          provide: LanguageService,
          useClass: MockLangService,
        },
      ],
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

    fixture = TestBed.createComponent(AnnouncementComponent);
    component = fixture.componentInstance;
    component.announcement = new UserAnnouncement('1234', 'title', 'body');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
