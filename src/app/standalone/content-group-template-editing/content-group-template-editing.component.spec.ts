import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentGroupTemplateEditingComponent } from './content-group-template-editing.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { NotificationService } from '@app/core/services/util/notification.service';
import {
  MockAnnounceService,
  MockNotificationService,
} from '@testing/test-helpers';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { BaseTemplateService } from '@app/core/services/http/base-template.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ContentGroupTemplateEditingComponent', () => {
  let component: ContentGroupTemplateEditingComponent;
  let fixture: ComponentFixture<ContentGroupTemplateEditingComponent>;

  const mockTemplateService = jasmine.createSpyObj('BaseTemplateService', [
    'getTemplateTags',
  ]);
  mockTemplateService.getTemplateTags.and.returnValue(of([]));

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ContentGroupTemplateEditingComponent,
        BrowserAnimationsModule,
        getTranslocoModule(),
      ],
      providers: [
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: BaseTemplateService,
          useValue: mockTemplateService,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {},
        },
        {
          provide: AnnounceService,
          useClass: MockAnnounceService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(ContentGroupTemplateEditingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
