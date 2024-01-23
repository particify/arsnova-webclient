import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticInfoComponent } from './statistic-info.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';

describe('StatisticInfoComponent', () => {
  let component: StatisticInfoComponent;
  let fixture: ComponentFixture<StatisticInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatisticInfoComponent, getTranslocoModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(StatisticInfoComponent);
    component = fixture.componentInstance;
    component.label = 'mean';
    component.round = 1;
    component.data = [1, 2];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
