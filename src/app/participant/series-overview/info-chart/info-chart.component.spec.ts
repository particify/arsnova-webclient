import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoChartComponent } from './info-chart.component';

describe('InfoChartComponent', () => {
  let component: InfoChartComponent;
  let fixture: ComponentFixture<InfoChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InfoChartComponent],
    });
    fixture = TestBed.createComponent(InfoChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
