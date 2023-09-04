import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { ContentService } from '@app/core/services/http/content.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { UserRole } from '@app/core/models/user-roles.enum';
import {
  ActivatedRouteStub,
  JsonTranslationLoader,
  MockNotificationService,
} from '@testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { AnswerListComponent } from './answer-list.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AnswerListComponent', () => {
  let component: AnswerListComponent;
  let fixture: ComponentFixture<AnswerListComponent>;

  const contentAnswerService = jasmine.createSpyObj('ContentAnswerService', [
    'hideAnswerText',
  ]);
  const contentService = jasmine.createSpyObj('ContentService', [
    'banKeywordForContent',
  ]);
  const dialogService = jasmine.createSpyObj('DialogService', [
    'openDeleteDialog',
  ]);

  const snapshot = new ActivatedRouteSnapshot();
  snapshot.data = {
    viewRole: UserRole.OWNER,
  };
  const activatedRouteStub = new ActivatedRouteStub(
    undefined,
    undefined,
    snapshot
  );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnswerListComponent],
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
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: ContentAnswerService,
          useValue: contentAnswerService,
        },
        {
          provide: ContentService,
          useValue: contentService,
        },
        {
          provide: DialogService,
          useValue: dialogService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AnswerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
