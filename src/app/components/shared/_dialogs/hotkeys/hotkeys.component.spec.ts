import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HotkeysComponent } from './hotkeys.component';
import { JsonTranslationLoader } from '@arsnova/testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

describe('HotkeysComponent', () => {
  let component: HotkeysComponent;
  let fixture: ComponentFixture<HotkeysComponent>;

  const mockDialogData = {
    hotkeys: []
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        HotkeysComponent
      ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader
          },
          isolate: true
        })
      ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: mockDialogData
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HotkeysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
