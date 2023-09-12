import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContentYesNoCreationComponent } from './content-yes-no-creation.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { getTranslocoModule } from '@testing/transloco-testing.module';

describe('ContentYesNoCreationComponent', () => {
  let component: ContentYesNoCreationComponent;
  let fixture: ComponentFixture<ContentYesNoCreationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentYesNoCreationComponent],
      providers: [],
      imports: [getTranslocoModule()],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ContentYesNoCreationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
