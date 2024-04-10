import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotkeyActionButtonComponent } from './hotkey-action-button.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { HotkeyService } from '@app/core/services/util/hotkey.service';

describe('HotkeyActionButtonComponent', () => {
  let component: HotkeyActionButtonComponent;
  let fixture: ComponentFixture<HotkeyActionButtonComponent>;

  const mockHotkeyService = jasmine.createSpyObj([
    'registerHotkey',
    'unregisterHotkey',
  ]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotkeyActionButtonComponent, getTranslocoModule()],
      providers: [
        {
          provide: HotkeyService,
          useValue: mockHotkeyService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HotkeyActionButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
