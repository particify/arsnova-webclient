import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentTemplatePreviewComponent } from './content-template-preview.component';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MockAnnounceService, MockMatDialogRef } from '@testing/test-helpers';
import { StepperComponent } from '@app/standalone/stepper/stepper.component';
import { ContentPreviewComponent } from '@app/standalone/content-preview/content-preview.component';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';

describe('ContentTemplatePreviewComponent', () => {
  let component: ContentTemplatePreviewComponent;
  let fixture: ComponentFixture<ContentTemplatePreviewComponent>;

  const mockHotkeyService = jasmine.createSpyObj(HotkeyService, [
    'registerHotkey',
    'unregisterHotkey',
  ]);

  const contentAnswerService = jasmine.createSpyObj(ContentAnswerService, [
    'getAnswerResultIcon',
  ]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        ContentTemplatePreviewComponent,
        getTranslocoModule(),
        MatDialogModule,
        StepperComponent,
        ContentPreviewComponent,
      ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            contents: [],
          },
        },
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef,
        },
        {
          provide: AnnounceService,
          useClass: MockAnnounceService,
        },
        {
          provide: HotkeyService,
          useValue: mockHotkeyService,
        },
        {
          provide: ContentAnswerService,
          useValue: contentAnswerService,
        },
      ],
    });
    fixture = TestBed.createComponent(ContentTemplatePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
