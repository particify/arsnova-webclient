import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { OverlayComponent } from './overlay.component';
import {
  MockMatDialogRef,
  JsonTranslationLoader,
} from '@arsnova/testing/test-helpers';
import { MatDialogRef } from '@angular/material/dialog';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('OverlayComponent', () => {
  let component: OverlayComponent;
  let fixture: ComponentFixture<OverlayComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [OverlayComponent],
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
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
