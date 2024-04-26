import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentStepInfoComponent } from './content-step-info.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';

describe('ContentStepInfoComponent', () => {
  let component: ContentStepInfoComponent;
  let fixture: ComponentFixture<ContentStepInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentStepInfoComponent, getTranslocoModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentStepInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
