import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContentCreationPageComponent } from './content-creation-page.component';
import { Injectable } from '@angular/core';
import { ContentService } from '../../../../services/http/content.service';
import { NotificationService } from '../../../../services/util/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { EventService } from '../../../../services/util/event.service';
import { RoomService } from '../../../../services/http/room.service';
import { DialogService } from '../../../../services/util/dialog.service';
import { ContentGroupService } from '../../../../services/http/content-group.service';
import { AnnounceService } from '@arsnova/app/services/util/announce.service';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { ActivatedRouteStub, JsonTranslationLoader, MockLangService } from '@arsnova/testing/test-helpers';
import { LanguageService } from '@arsnova/app/services/util/language.service';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';
import { RoomStatsService } from '@arsnova/app/services/http/room-stats.service';
import { FormattingService } from '@arsnova/app/services/http/formatting.service';
import { A11yIntroPipe } from '@arsnova/app/pipes/a11y-intro.pipe';
import { MatMenuModule } from '@angular/material/menu';
import { of } from 'rxjs';
import { ContentType } from '@arsnova/app/models/content-type.enum';

@Injectable()
class MockContentService {
  getTypeIcons() {
    return new Map<ContentType, string>();
  }
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
class MockDialogService {
}

@Injectable()
class MockContentGroupService {
}

@Injectable()
class MockRoomStatsService {
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
class MockFormattingService{
}

describe('ContentCreationPageComponent', () => {
  let component: ContentCreationPageComponent;
  let fixture: ComponentFixture<ContentCreationPageComponent>;

  const data = {
    room: {
      id: '1234'
    }
  }

  const snapshot = new ActivatedRouteSnapshot();

  snapshot.params = of([{seriesName: 'SERIES'}]);

  const activatedRouteStub = new ActivatedRouteStub(null, data, snapshot);

  let translateService: TranslateService;

  const a11yIntroPipe = new A11yIntroPipe(translateService);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ContentCreationPageComponent,
        A11yIntroPipe
      ],
      providers: [
        {
          provide: DialogService,
          useClass: MockDialogService
        },
        {
          provide: ContentService,
          useClass: MockContentService
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService
        },
        {
          provide: MatDialog,
          useClass: MockMatDialiog
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
          provide: LanguageService,
          useClass: MockLangService
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService
        },
        {
          provide: RoomStatsService,
          useClass: MockRoomStatsService
        },
        {
          provide: FormattingService,
          useClass: MockFormattingService
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
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ContentCreationPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
