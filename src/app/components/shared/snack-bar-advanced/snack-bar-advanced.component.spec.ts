import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SnackBarAdvancedComponent } from './snack-bar-advanced.component';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('SnackBarAdvancedComponent', () => {
  let component: SnackBarAdvancedComponent;
  let fixture: ComponentFixture<SnackBarAdvancedComponent>;

  const mockMatSnackBarData = {
    message: 'hi',
    icon: 'check',
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SnackBarAdvancedComponent],
      providers: [
        {
          provide: MAT_SNACK_BAR_DATA,
          useValue: mockMatSnackBarData,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SnackBarAdvancedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
