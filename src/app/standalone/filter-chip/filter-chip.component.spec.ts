import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterChipComponent } from './filter-chip.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('FilterChipComponent', () => {
  let component: FilterChipComponent;
  let fixture: ComponentFixture<FilterChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterChipComponent, getTranslocoModule()],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
