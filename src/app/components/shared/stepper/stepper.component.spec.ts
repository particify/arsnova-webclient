import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { StepperComponent } from './stepper.component';
import { JsonTranslationLoader } from '@arsnova/testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { AnnounceService } from '@arsnova/app/services/util/announce.service';
import { MockAnnounceService } from '@arsnova/testing/test-helpers';
import { HotkeyService } from '@arsnova/app/services/util/hotkey.service';
import { Directionality } from '@angular/cdk/bidi';
import { ChangeDetectorRef, ElementRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('StepperComponent', () => {
  let component: StepperComponent;
  let fixture: ComponentFixture<StepperComponent>;

  let document: Document;
  let dir: Directionality;
  let elementRef: ElementRef;
  let changeDetectorRef: ChangeDetectorRef;

  const mockHotkeyService = jasmine.createSpyObj(['registerHotkey', 'unregisterHotkey']);

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
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepperComponent);
    component = fixture.componentInstance;
    document = TestBed.inject(DOCUMENT);
    setTimeout(() => {
      fixture.detectChanges();
    }, 1000);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
