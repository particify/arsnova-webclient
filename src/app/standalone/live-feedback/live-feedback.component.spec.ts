import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveFeedbackComponent } from './live-feedback.component';
import {
  JsonTranslationLoader,
  MockAnnounceService,
} from '@testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { AnnounceService } from '@app/core/services/util/announce.service';

describe('LiveFeedbackComponent', () => {
  let component: LiveFeedbackComponent;
  let fixture: ComponentFixture<LiveFeedbackComponent>;

  const mockHotkeyService = jasmine.createSpyObj('HotkeyService', [
    'registerHotkey',
    'unregisterHotkey',
  ]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LiveFeedbackComponent,
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
          provide: HotkeyService,
          useValue: mockHotkeyService,
        },
        {
          provide: AnnounceService,
          useClass: MockAnnounceService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LiveFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
