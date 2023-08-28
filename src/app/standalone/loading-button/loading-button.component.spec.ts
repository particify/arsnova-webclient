import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingButtonComponent } from './loading-button.component';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { TrackingService } from '@app/core/services/util/tracking.service';
import { CoreModule } from '@app/core/core.module';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { JsonTranslationLoader } from '@testing/test-helpers';

describe('LoadingButtonComponent', () => {
  let component: LoadingButtonComponent;
  let fixture: ComponentFixture<LoadingButtonComponent>;

  const mockHotkeyService = jasmine.createSpyObj('HotkeyService', [
    'registerHotkey',
    'unregisterHotkey',
  ]);

  const mockTrackingService = jasmine.createSpyObj('TrackingService', [
    'addEvent',
  ]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoadingButtonComponent,
        CoreModule,
        LoadingIndicatorComponent,
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
          provide: TrackingService,
          useValue: mockTrackingService,
        },
      ],
    });
    fixture = TestBed.createComponent(LoadingButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
