import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentStepInfoComponent } from './content-step-info.component';

describe('ContentStepInfoComponent', () => {
  let component: ContentStepInfoComponent;
  let fixture: ComponentFixture<ContentStepInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentStepInfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentStepInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
