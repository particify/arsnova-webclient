import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentSortStatisticComponent } from './content-sort-statistic.component';

describe('ContentSortStatisticComponent', () => {
  let component: ContentSortStatisticComponent;
  let fixture: ComponentFixture<ContentSortStatisticComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContentSortStatisticComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentSortStatisticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
