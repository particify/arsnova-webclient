import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ContentParticipantComponent } from './content-participant.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { A11yRenderedBodyPipe } from '@app/core/pipes/a11y-rendered-body.pipe';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { EventService } from '@app/core/services/util/event.service';
import {
  ActivatedRouteStub,
  MockEventService,
  MockFeatureFlagService,
  MockGlobalStorageService,
  MockNotificationService,
} from '@testing/test-helpers';
import { ContentService } from '@app/core/services/http/content.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { Room } from '@app/core/models/room';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { ENVIRONMENT } from '@environments/environment-token';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { ContentChoice } from '@app/core/models/content-choice';
import { ContentGroup } from '@app/core/models/content-group';

describe('ContentParticipantComponent', () => {
  let component: ContentParticipantComponent;
  let fixture: ComponentFixture<ContentParticipantComponent>;

  const a11yRenderedBodyPipe = new A11yRenderedBodyPipe();

  const mockContentService = jasmine.createSpyObj('ContentService', [
    'getContent',
  ]);

  const snapshot = new ActivatedRouteSnapshot();
  snapshot.params = of([{ seriesName: 'SERIES' }]);
  snapshot.data = {
    room: new Room(),
  };
  const activatedRouteStub = new ActivatedRouteStub(
    undefined,
    undefined,
    snapshot
  );

  const formattingService = jasmine.createSpyObj(['postString']);
  formattingService.postString.and.returnValue(of('rendered'));

  const mockContentAnswerService = jasmine.createSpyObj(['addAnswerChoice']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [A11yRenderedBodyPipe],
      imports: [getTranslocoModule(), ContentParticipantComponent],
      providers: [
        {
          provide: A11yRenderedBodyPipe,
          useValue: a11yRenderedBodyPipe,
        },
        {
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: ContentService,
          useValue: mockContentService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
        {
          provide: FormattingService,
          useValue: formattingService,
        },
        {
          provide: ENVIRONMENT,
          useValue: {},
        },
        {
          provide: FeatureFlagService,
          useClass: MockFeatureFlagService,
        },
        {
          provide: ContentAnswerService,
          useValue: mockContentAnswerService,
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentParticipantComponent);
    component = fixture.componentInstance;
    component.content = new ContentChoice('1234', 'subject', 'body', []);
    component.contentGroup = new ContentGroup();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
