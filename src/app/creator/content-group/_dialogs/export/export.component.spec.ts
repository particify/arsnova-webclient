import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ExportComponent } from './export.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { MatDialogRef } from '@angular/material/dialog';

import { MockMatDialogRef } from '@testing/test-helpers';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ExportComponent', () => {
  let component: ExportComponent;
  let fixture: ComponentFixture<ExportComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [getTranslocoModule(), ExportComponent],
      providers: [
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
