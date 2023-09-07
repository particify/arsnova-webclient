import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveFeedbackComponent } from './live-feedback.component';
import { MockAnnounceService } from '@testing/test-helpers';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatIconHarness } from '@angular/material/icon/testing';
import { LiveFeedbackType } from '@app/core/models/live-feedback-type.enum';
import { By } from '@angular/platform-browser';

describe('LiveFeedbackComponent', () => {
  let component: LiveFeedbackComponent;
  let fixture: ComponentFixture<LiveFeedbackComponent>;

  const mockHotkeyService = jasmine.createSpyObj('HotkeyService', [
    'registerHotkey',
    'unregisterHotkey',
  ]);

  let loader: HarnessLoader;
  let icon: MatIconHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiveFeedbackComponent, getTranslocoModule()],
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
    loader = TestbedHarnessEnvironment.loader(fixture);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display correct labels type is feedback', async () => {
    component.type = LiveFeedbackType.FEEDBACK;
    fixture.detectChanges();
    icon = await loader.getHarness(MatIconHarness);
    expect(icon).not.toBeNull('Icon should be displayed');
    const answerLabel = fixture.debugElement.query(By.css('.answer-label'));
    expect(answerLabel).toBeNull('Answer label should not be displayed');
  });

  it('should display correct labels if type is survey', () => {
    component.type = LiveFeedbackType.SURVEY;
    fixture.detectChanges();
    const icon = fixture.debugElement.query(By.css('mat-icon'));
    expect(icon).toBeNull('Icon should not be displayed');
    const answerLabel = fixture.debugElement.query(By.css('.answer-label'));
    expect(answerLabel).not.toBeNull('Answer label should be displayed');
  });

  it('should display correct labels if type is survey', () => {
    component.type = LiveFeedbackType.SURVEY;
    fixture.detectChanges();
    const icon = fixture.debugElement.query(By.css('mat-icon'));
    expect(icon).toBeNull('Icon should not be displayed');
    const answerLabel = fixture.debugElement.query(By.css('.answer-label'));
    expect(answerLabel).not.toBeNull('Answer label should be displayed');
  });

  it('should display progress bar', () => {
    const bar = fixture.debugElement.query(By.css('mat-progress-bar'));
    expect(bar).not.toBeNull();
  });
});
