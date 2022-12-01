import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { ContentGroupService } from '@arsnova/app/services/http/content-group.service';
import { ContentService } from '@arsnova/app/services/http/content.service';
import { RoomService } from '@arsnova/app/services/http/room.service';
import { AnnounceService } from '@arsnova/app/services/util/announce.service';
import { EventService } from '@arsnova/app/services/util/event.service';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { ActivatedRouteStub, JsonTranslationLoader, MockAnnounceService, MockEventService, MockNotificationService } from '@arsnova/testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of, Subject } from 'rxjs';

import { ContentPrioritizationCreationComponent } from './content-prioritization-creation.component';

describe('ContentPrioritizationCreationComponent', () => {
  let component: ContentPrioritizationCreationComponent;
  let fixture: ComponentFixture<ContentPrioritizationCreationComponent>;

  const mockCreateEvent = new Subject<any>();

  const mockContentService = jasmine.createSpyObj('ContentService', ['']);
  const mockRoomService = jasmine.createSpyObj('RoomService', ['']);
  const mockContentGroupService = jasmine.createSpyObj('ContentGroupService', ['']);

  const data = {
    room: {
      id: '1234'
    }
  }

  const snapshot = new ActivatedRouteSnapshot();

  snapshot.params = of([{seriesName: 'SERIES'}]);

  const activatedRouteStub = new ActivatedRouteStub(null, data, snapshot);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContentPrioritizationCreationComponent ],
      providers: [
        {
          provide: NotificationService,
          useClass: MockNotificationService
        },
        {
          provide: EventService,
          useClass: MockEventService
        },
        {
          provide: AnnounceService,
          useClass: MockAnnounceService
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub
        },
        {
          provide: ContentService,
          useValue: mockContentService
        },
        {
          provide: RoomService,
          useValue: mockRoomService
        },
        {
          provide: ContentGroupService,
          useValue: mockContentGroupService
        }
      ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader
          },
          isolate: true
        })
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentPrioritizationCreationComponent);
    component = fixture.componentInstance;
    component.createEvent = mockCreateEvent;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
