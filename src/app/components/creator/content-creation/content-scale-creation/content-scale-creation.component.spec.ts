import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContentScaleCreationComponent } from './content-scale-creation.component';
import { Injectable } from '@angular/core';
import { ContentService } from '../../../../services/http/content.service';
import { NotificationService } from '../../../../services/util/notification.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { EventService } from '../../../../services/util/event.service';
import { RoomService } from '../../../../services/http/room.service';
import { of, Subject } from 'rxjs';
import { ContentGroupService } from '../../../../services/http/content-group.service';
import { AnnounceService } from '@arsnova/app/services/util/announce.service';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { ActivatedRouteStub, JsonTranslationLoader } from '@arsnova/testing/test-helpers';
import { LikertScaleService } from '@arsnova/app/services/util/likert-scale.service';

const mockCreateEvent = new Subject<any>();

@Injectable()
class MockContentService {
}

@Injectable()
class MockNotificationService {
}

@Injectable()
class MockMatDialiog {
  afterClosed() {}
}

@Injectable()
class MockEventService {
}

@Injectable()
class MockRoomService {
}

@Injectable()
class MockContentGroupService {
}

@Injectable()
class MockGlobalStorageService {
  getItem(key: string) {
    return undefined;
  }

  setItem(key: string, value: any) {
  }
}

@Injectable()
class MockAnnouncer {
}

@Injectable()
class MockLikertScaleService {
  getOptionLabels(){
  }
}

describe('ContentScaleCreationComponent', () => {
  let component: ContentScaleCreationComponent;
  let fixture: ComponentFixture<ContentScaleCreationComponent>;

  const data = {
    room: {
      id: '1234'
    }
  }

  const snapshot = new ActivatedRouteSnapshot();

  snapshot.params = of([{seriesName: 'SERIES'}]);

  const activatedRouteStub = new ActivatedRouteStub(null, data, snapshot);
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ContentScaleCreationComponent
      ],
      providers: [
        {
          provide: ContentService,
          useClass: MockContentService
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService
        },
        {
          provide: EventService,
          useClass: MockEventService
        },
        {
          provide: RoomService,
          useClass: MockRoomService
        },
        {
          provide: ContentGroupService,
          useClass: MockContentGroupService
        },
        {
          provide: AnnounceService,
          useClass: MockAnnouncer
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub
        },
        {
          provide: LikertScaleService,
          useClass: MockLikertScaleService
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
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ContentScaleCreationComponent);
        component = fixture.componentInstance;
        component.createEvent = mockCreateEvent;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
