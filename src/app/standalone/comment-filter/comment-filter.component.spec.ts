import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentFilterComponent } from './comment-filter.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { TrackingService } from '@app/core/services/util/tracking.service';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

class MockTrackingService {}

describe('CommentFilterComponent', () => {
  let component: CommentFilterComponent;
  let fixture: ComponentFixture<CommentFilterComponent>;

  const mockHotkeyService = jasmine.createSpyObj('HotkeyService', [
    'registerHotkey',
    'unregisterHotkey',
  ]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommentFilterComponent,
        getTranslocoModule(),
        BrowserAnimationsModule,
      ],
      providers: [
        {
          provide: TrackingService,
          useClass: MockTrackingService,
        },
        {
          provide: HotkeyService,
          useValue: mockHotkeyService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
