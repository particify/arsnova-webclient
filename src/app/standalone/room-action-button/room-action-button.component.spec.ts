import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomActionButtonComponent } from './room-action-button.component';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { ActivatedRouteStub } from '@testing/test-helpers';
import { getTranslocoModule } from '@testing/transloco-testing.module';

describe('RoomActionButtonComponent', () => {
  let component: RoomActionButtonComponent;
  let fixture: ComponentFixture<RoomActionButtonComponent>;

  const snapshot = new ActivatedRouteSnapshot();

  const activatedRouteStub = new ActivatedRouteStub(
    undefined,
    undefined,
    snapshot
  );

  const mockHotkeyService = jasmine.createSpyObj('HotkeyService', [
    'registerHotkey',
    'unregisterHotkey',
  ]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomActionButtonComponent, getTranslocoModule()],
      providers: [
        {
          provide: HotkeyService,
          useValue: mockHotkeyService,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomActionButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
