import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { KeyButtonBarComponent } from './key-button-bar.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { DOCUMENT } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('KeyButtonBarComponent', () => {
  let component: KeyButtonBarComponent;
  let fixture: ComponentFixture<KeyButtonBarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [getTranslocoModule(), KeyButtonBarComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: Document,
          useExisting: DOCUMENT,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyButtonBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
