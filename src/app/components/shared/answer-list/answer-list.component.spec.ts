import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { ContentAnswerService } from '@arsnova/app/services/http/content-answer.service';
import { ContentService } from '@arsnova/app/services/http/content.service';
import { DialogService } from '@arsnova/app/services/util/dialog.service';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { UserRole } from '@arsnova/app/models/user-roles.enum';
import { ActivatedRouteStub, JsonTranslationLoader, MockNotificationService } from '@arsnova/testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { AnswerListComponent } from './answer-list.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AnswerListComponent', () => {
  let component: AnswerListComponent;
  let fixture: ComponentFixture<AnswerListComponent>;

  const contentAnswerService = jasmine.createSpyObj('ContentAnswerService', ['hideAnswerText']);
  const contentService = jasmine.createSpyObj('ContentService', ['banKeywordForContent']);
  const dialogService = jasmine.createSpyObj('DialogService', ['openDeleteDialog']);

  const snapshot = new ActivatedRouteSnapshot();
  snapshot.data = {
    viewRole: UserRole.CREATOR
  }
  const activatedRouteStub = new ActivatedRouteStub(null, null, snapshot);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnswerListComponent ],
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
          provide: ActivatedRoute,
          useValue: activatedRouteStub
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService
        },
        {
          provide: ContentAnswerService,
          useValue: contentAnswerService
        },
        {
          provide: ContentService,
          useValue: contentService
        },
        {
          provide: DialogService,
          useValue: dialogService
        }
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnswerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
