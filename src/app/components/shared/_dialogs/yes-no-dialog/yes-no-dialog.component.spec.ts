import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { YesNoDialogComponent } from './yes-no-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  JsonTranslationLoader,
  MockMatDialogRef,
} from '@arsnova/testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('YesNoDialogComponent', () => {
  let component: YesNoDialogComponent;
  let fixture: ComponentFixture<YesNoDialogComponent>;

  const mockMatDialogData = {
    section: 'section',
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [YesNoDialogComponent],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
      ],
      providers: [
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: mockMatDialogData,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YesNoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
