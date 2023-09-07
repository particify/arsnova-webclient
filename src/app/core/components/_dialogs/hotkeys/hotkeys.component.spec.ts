import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HotkeysComponent } from './hotkeys.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Hotkey } from '@app/core/services/util/hotkey.service';

describe('HotkeysComponent', () => {
  let component: HotkeysComponent;
  let fixture: ComponentFixture<HotkeysComponent>;

  const mockDialogData = {
    hotkeys: [] as Hotkey[],
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HotkeysComponent],
      imports: [getTranslocoModule()],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: mockDialogData,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HotkeysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
