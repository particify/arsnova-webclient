import {  ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ArsSliderCombComponent } from './ars-slider-comb.component';

describe('ArsSliderCombComponent', () => {
  let component: ArsSliderCombComponent;
  let fixture: ComponentFixture<ArsSliderCombComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ArsSliderCombComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArsSliderCombComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
