import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BinaryContentFormComponent } from './binary-content-form.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { getTranslocoModule } from '@testing/transloco-testing.module';

describe('BinaryContentFormComponent', () => {
  let component: BinaryContentFormComponent;
  let fixture: ComponentFixture<BinaryContentFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BinaryContentFormComponent],
      providers: [],
      imports: [getTranslocoModule()],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(BinaryContentFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
