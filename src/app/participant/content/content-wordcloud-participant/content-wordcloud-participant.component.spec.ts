import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ContentWordcloudParticipantComponent } from './content-wordcloud-participant.component';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
import { NotificationService } from '@app/core/services/util/notification.service';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import {
  MockNotificationService,
  ActivatedRouteStub,
  MockGlobalStorageService,
  MockRouter,
  MockEventService,
} from '@testing/test-helpers';
import { of } from 'rxjs';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { NO_ERRORS_SCHEMA, EventEmitter } from '@angular/core';
import { ContentWordcloud } from '@app/core/models/content-wordcloud';
import { ContentType } from '@app/core/models/content-type.enum';
import { EventService } from '@app/core/services/util/event.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ContentWordcloudParticipantComponent', () => {
  let component: ContentWordcloudParticipantComponent;
  let fixture: ComponentFixture<ContentWordcloudParticipantComponent>;

  const mockContentAnswerService = jasmine.createSpyObj(['addAnswer']);

  const snapshot = new ActivatedRouteSnapshot();

  const params = {
    shortId: '12345678',
    seriesName: 'Quiz',
  };

  snapshot.params = of([params]);

  const activatedRouteStub = new ActivatedRouteStub(
    undefined,
    undefined,
    snapshot
  );

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        getTranslocoModule(),
        ContentWordcloudParticipantComponent,
        BrowserAnimationsModule,
      ],
      providers: [
        {
          provide: ContentAnswerService,
          useValue: mockContentAnswerService,
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
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: EventService,
          useClass: MockEventService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentWordcloudParticipantComponent);
    component = fixture.componentInstance;
    component.content = new ContentWordcloud(
      '1234',
      'subject',
      'body',
      [],
      ContentType.WORDCLOUD,
      3
    );
    component.sendEvent = new EventEmitter<string>();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
