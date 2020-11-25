import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticSortComponent } from '@arsnova/app/components/shared/statistic-content/statistic-sort/statistic-sort.component';

describe('ContentSortStatisticComponent', () => {
  let component: StatisticSortComponent;
  let fixture: ComponentFixture<StatisticSortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatisticSortComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatisticSortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
