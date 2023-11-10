import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTemplateButtonComponent } from './add-template-button.component';

describe('AddTemplateButtonComponent', () => {
  let component: AddTemplateButtonComponent;
  let fixture: ComponentFixture<AddTemplateButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AddTemplateButtonComponent]
    });
    fixture = TestBed.createComponent(AddTemplateButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
