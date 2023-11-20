import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributionsInfoComponent } from './attributions-info.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';

describe('AttributionsInfoComponent', () => {
  let component: AttributionsInfoComponent;
  let fixture: ComponentFixture<AttributionsInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AttributionsInfoComponent, getTranslocoModule()],
    });
    fixture = TestBed.createComponent(AttributionsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
