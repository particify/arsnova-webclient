import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { StepperComponent } from './stepper.component';
import { MockAnnounceService } from '@testing/test-helpers';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { Directionality } from '@angular/cdk/bidi';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA, ElementRef } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';

describe('StepperComponent', () => {
  let component: StepperComponent;
  let fixture: ComponentFixture<StepperComponent>;

  let dir: Directionality;
  let elementRef: ElementRef;
  let changeDetectorRef: ChangeDetectorRef;

  const mockHotkeyService = jasmine.createSpyObj([
    'registerHotkey',
    'unregisterHotkey',
  ]);

  const mockFocusModeService = jasmine.createSpyObj(['getFocusModeEnabled']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        StepperComponent,
        getTranslocoModule(),
        BrowserAnimationsModule,
      ],
      providers: [
        {
          provide: AnnounceService,
          useClass: MockAnnounceService,
        },
        {
          provide: HotkeyService,
          useValue: mockHotkeyService,
        },
        {
          provide: Directionality,
          useValue: dir,
        },
        {
          provide: ChangeDetectorRef,
          useValue: changeDetectorRef,
        },
        {
          provide: ElementRef,
          useValue: elementRef,
        },
        {
          provide: FocusModeService,
          useValue: mockFocusModeService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
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
