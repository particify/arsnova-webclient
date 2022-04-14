import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LooseContentComponent } from './loose-content.component';
import { Injectable } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  ActivatedRouteStub,
  JsonTranslationLoader,
  MockLangService,
  MockNotificationService,
  MockRouter
} from '@arsnova/testing/test-helpers';
import { ContentService } from '@arsnova/app/services/http/content.service';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { EventService } from '@arsnova/app/services/util/event.service';
import { RoomService } from '@arsnova/app/services/http/room.service';
import { ContentGroupService } from '@arsnova/app/services/http/content-group.service';
import { AnnounceService } from '@arsnova/app/services/util/announce.service';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { RoomStatsService } from '@arsnova/app/services/http/room-stats.service';
import { DialogService } from '@arsnova/app/services/util/dialog.service';
import { LanguageService } from '@arsnova/app/services/util/language.service';
import { Location } from '@angular/common';
import { MockLocationStrategy } from '@angular/common/testing';
import { LocalFileService } from '@arsnova/app/services/util/local-file.service';
import { HotkeyService } from '@arsnova/app/services/util/hotkey.service';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';
import { of } from 'rxjs';
import { A11yIntroPipe } from '@arsnova/app/pipes/a11y-intro.pipe';
import { MatMenuModule } from '@angular/material/menu';
import { Content } from '@arsnova/app/models/content';
import { ContentType } from '@arsnova/app/models/content-type.enum';
import { ContentState } from '@arsnova/app/models/content-state';
import { ContentGroup } from '@arsnova/app/models/content-group';
import { Room } from '@arsnova/app/models/room';

@Injectable()
class MockGlobalStorageService {
  getItem(key: symbol) {
    return undefined;
  }

  setItem(key: symbol, value: any) {
  }

  removeItem(key: symbol) {
  }
}

@Injectable()
class MockContentService {
  findContentsWithoutGroup() {
    return of([new Content('1234', '0', '1', 'subject', 'body', [], ContentType.CHOICE, {}, new ContentState(1, new Date(), true))]);
  }
}

@Injectable()
class MockEventService {
  on() {
    return of('1234');
  }
}

@Injectable()
class MockRoomService {
}

@Injectable()
class MockContentGroupService {
  getByRoomIdAndName(){
    return of(new ContentGroup('1234', '0', 'roomId', 'name', [], true));
  }
  isIndexPublished() {
    return true;
  }
}

@Injectable()
class MockAnnouncer {
  announce(){
  }
}

@Injectable()
class MockRoomStatsService {
  getStats(){
    return of({});
  }
}

@Injectable()
class MockDialogService {
}

@Injectable()
class MockLocalFileService {
}

@Injectable()
class MockHotykeyService {
}

describe('LooseContentComponent', () => {
  let component: LooseContentComponent;
  let fixture: ComponentFixture<LooseContentComponent>;

  const data = {
    room: new Room('1234', 'shortId', 'abbreviation', 'name', 'description')
  }

  const snapshot = new ActivatedRouteSnapshot();

  snapshot.params = of([{seriesName: 'SERIES'}]);

  const activatedRouteStub = new ActivatedRouteStub(null, data, snapshot);

  let translateService: TranslateService;

  const a11yIntroPipe = new A11yIntroPipe(translateService);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        LooseContentComponent,
        A11yIntroPipe
      ],
      providers: [
        {
          provide: ContentService,
          useClass: MockContentService
        },
        {
          provide: RoomStatsService,
          useClass: MockRoomStatsService
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
          provide: DialogService,
          useClass: MockDialogService
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService
        },
        {
          provide: LanguageService,
          useClass: MockLangService
        },
        {
          provide: Location,
          useClass: MockLocationStrategy
        },
        {
          provide: LocalFileService,
          useClass: MockLocalFileService
        },
        {
          provide: Router,
          useClass: MockRouter
        },
        {
          provide: HotkeyService,
          useClass: MockHotykeyService
        },
        {
          provide: A11yIntroPipe,
          useValue: a11yIntroPipe
        }
      ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader
          },
          isolate: true
        }),
        MatMenuModule
      ]
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(LooseContentComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
