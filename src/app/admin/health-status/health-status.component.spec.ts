import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthStatusComponent } from './health-status.component';

describe('HealthStatusComponent', () => {
  let component: HealthStatusComponent;
  let fixture: ComponentFixture<HealthStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthStatusComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HealthStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
