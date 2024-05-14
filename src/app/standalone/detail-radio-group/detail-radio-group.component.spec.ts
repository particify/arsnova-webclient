import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  DetailRadioGroupComponent,
  DetailedRadioGroup,
} from './detail-radio-group.component';

describe('DetailRadioGroupComponent', () => {
  let component: DetailRadioGroupComponent;
  let fixture: ComponentFixture<DetailRadioGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailRadioGroupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailRadioGroupComponent);
    component = fixture.componentInstance;
    component.items = [
      new DetailedRadioGroup('value', 'title', 'description', 'icon'),
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
