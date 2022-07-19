import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LanguageService } from '@arsnova/app/services/util/language.service';
import { DateFormatPipe } from '@arsnova/app/pipes/date-format.pipe';
import { JsonTranslationLoader, MockLangService } from '@arsnova/testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { AnnouncementComponent } from './announcement.component';
import { UserAnnouncement } from '@arsnova/app/models/user-announcement';

describe('AnnouncementComponent', () => {
  let component: AnnouncementComponent;
  let fixture: ComponentFixture<AnnouncementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AnnouncementComponent,
        DateFormatPipe
      ],
      providers: [
        {
          provide: LanguageService,
          useClass: MockLangService
        }
      ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader
          },
          isolate: true
        })
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnouncementComponent);
    component = fixture.componentInstance;
    component.announcement = new UserAnnouncement('1234', 'title', 'body');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
