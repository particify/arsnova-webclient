import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateLicenseComponent } from './template-license.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';

describe('TemplateLicenseComponent', () => {
  let component: TemplateLicenseComponent;
  let fixture: ComponentFixture<TemplateLicenseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TemplateLicenseComponent, getTranslocoModule()],
    });
    fixture = TestBed.createComponent(TemplateLicenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
