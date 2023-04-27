import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PublishContentComponent } from './publish-content.component';
import {
  JsonTranslationLoader,
  MockMatDialogRef,
} from '@arsnova/testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('PublishContentComponent', () => {
  let component: PublishContentComponent;
  let fixture: ComponentFixture<PublishContentComponent>;

  const dialogData = 'publish';

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PublishContentComponent],
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
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublishContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
