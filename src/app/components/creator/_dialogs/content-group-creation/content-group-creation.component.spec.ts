import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContentGroupCreationComponent } from './content-group-creation.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA, Injectable } from '@angular/core';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { EventService } from '@arsnova/app/services/util/event.service';
import { ContentGroupService } from '@arsnova/app/services/http/content-group.service';
import {
  JsonTranslationLoader,
  MockEventService,
  MockNotificationService,
  MockMatDialog,
  MockMatDialogRef
} from '@arsnova/testing/test-helpers';

@Injectable()
class MockContentGroupService {
}

describe('ContentGroupCreationComponent', () => {
  let component: ContentGroupCreationComponent;
  let fixture: ComponentFixture<ContentGroupCreationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentGroupCreationComponent ],
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
          provide: NotificationService,
          useClass: MockNotificationService
        },
        {
          provide: MatDialog,
          useClass: MockMatDialog
        },
        {
          provide: EventService,
          useClass: MockEventService
        },
        {
          provide: ContentGroupService,
          useClass: MockContentGroupService
        },
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef
        }
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    })
    .compileComponents();
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

