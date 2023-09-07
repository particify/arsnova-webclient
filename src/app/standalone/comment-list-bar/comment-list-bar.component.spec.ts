import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentListBarComponent } from './comment-list-bar.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { TrackingService } from '@app/core/services/util/tracking.service';
import { HotkeyService } from '@app/core/services/util/hotkey.service';

class MockTrackingService {}

describe('CommentListBarComponent', () => {
  let component: CommentListBarComponent;
  let fixture: ComponentFixture<CommentListBarComponent>;

  const mockHotkeyService = jasmine.createSpyObj('HotkeyService', [
    'registerHotkey',
    'unregisterHotkey',
  ]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentListBarComponent, getTranslocoModule()],
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

    fixture = TestBed.createComponent(CommentListBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
