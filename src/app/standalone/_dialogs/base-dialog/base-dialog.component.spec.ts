import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BaseDialogComponent } from './base-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MockMatDialogRef } from '@testing/test-helpers';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('BaseDialogComponent', () => {
  let component: BaseDialogComponent;
  let fixture: ComponentFixture<BaseDialogComponent>;

  const mockMatDialogData = {
    dialogId: 'dialogId',
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BaseDialogComponent],
      imports: [getTranslocoModule()],
      providers: [
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: mockMatDialogData,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
