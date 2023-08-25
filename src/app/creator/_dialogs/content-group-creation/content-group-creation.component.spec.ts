import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContentGroupCreationComponent } from './content-group-creation.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA, Injectable } from '@angular/core';
import { NotificationService } from '@app/core/services/util/notification.service';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import {
  JsonTranslationLoader,
  MockNotificationService,
  MockMatDialog,
  MockMatDialogRef,
} from '@testing/test-helpers';

@Injectable()
class MockContentGroupService {}

describe('ContentGroupCreationComponent', () => {
  let component: ContentGroupCreationComponent;
  let fixture: ComponentFixture<ContentGroupCreationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentGroupCreationComponent],
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
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: MatDialog,
          useClass: MockMatDialog,
        },
        {
          provide: ContentGroupService,
          useClass: MockContentGroupService,
        },
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentGroupCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
