import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DialogActionButtonsComponent } from './dialog-action-buttons.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { JsonTranslationLoader } from '@testing/test-helpers';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('DialogActionButtonsComponent', () => {
  let component: DialogActionButtonsComponent;
  let fixture: ComponentFixture<DialogActionButtonsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DialogActionButtonsComponent],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogActionButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
