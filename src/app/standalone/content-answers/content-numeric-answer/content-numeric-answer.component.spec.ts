import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentNumericAnswerComponent } from './content-numeric-answer.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { ContentNumeric } from '@app/core/models/content-numeric';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ContentNumericAnswerComponent', () => {
  let component: ContentNumericAnswerComponent;
  let fixture: ComponentFixture<ContentNumericAnswerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ContentNumericAnswerComponent,
        BrowserAnimationsModule,
        getTranslocoModule(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentNumericAnswerComponent);
    component = fixture.componentInstance;
    component.content = new ContentNumeric();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
