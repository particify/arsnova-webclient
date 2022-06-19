import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { StepperComponent } from './stepper.component';
import { JsonTranslationLoader } from '@arsnova/testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { AnnounceService } from '@arsnova/app/services/util/announce.service';
import { MockAnnounceService } from '@arsnova/testing/test-helpers';
import { HotkeyService } from '@arsnova/app/services/util/hotkey.service';
import { Directionality } from '@angular/cdk/bidi';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA, ElementRef } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RemoteService } from '@arsnova/app/services/util/remote.service';

describe('StepperComponent', () => {
  let component: StepperComponent;
  let fixture: ComponentFixture<StepperComponent>;

  let dir: Directionality;
  let elementRef: ElementRef;
  let changeDetectorRef: ChangeDetectorRef;

  const mockHotkeyService = jasmine.createSpyObj(['registerHotkey', 'unregisterHotkey']);

  const mockRemoteService = jasmine.createSpyObj(['getFocusModeState']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StepperComponent ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader
          },
          isolate: true
        }),
        BrowserAnimationsModule
      ],
      providers: [
        {
          provide: AnnounceService,
          useClass: MockAnnounceService
        },
        {
          provide: HotkeyService,
          useValue: mockHotkeyService
        },
        {
          provide: Directionality,
          useValue: dir
        },
        {
          provide: ChangeDetectorRef,
          useValue: changeDetectorRef
        },
        {
          provide: ElementRef,
          useValue: elementRef
        },
        {
          provide: RemoteService,
          useValue: mockRemoteService
        }
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepperComponent);
    component = fixture.componentInstance;
    setTimeout(() => {
      fixture.detectChanges();
    }, 1000);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
