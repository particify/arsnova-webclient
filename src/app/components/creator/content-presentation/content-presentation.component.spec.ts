import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContentPresentationComponent } from './content-presentation.component';
import { ContentService } from '@arsnova/app/services/http/content.service';
import { EventService } from '@arsnova/app/services/util/event.service';
import { RoomService } from '@arsnova/app/services/http/room.service';
import { ContentGroupService } from '@arsnova/app/services/http/content-group.service';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { DialogService } from '@arsnova/app/services/util/dialog.service';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';
import { LanguageService } from '@arsnova/app/services/util/language.service';
import {
  ActivatedRouteStub, JsonTranslationLoader,
  MockEventService,
  MockGlobalStorageService,
  MockLangService,
  MockRouter
} from '@arsnova/testing/test-helpers';
import { Location } from '@angular/common';
import { MockLocationStrategy } from '@angular/common/testing';
import { HotkeyService } from '@arsnova/app/services/util/hotkey.service';
import { NO_ERRORS_SCHEMA, Injectable } from '@angular/core';
import { Room } from '@arsnova/app/models/room';
import { of } from 'rxjs';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ContentGroup } from '@arsnova/app/models/content-group';
import { Content } from '@arsnova/app/models/content';
import { ContentType } from '@arsnova/app/models/content-type.enum';
import { ContentState } from '@arsnova/app/models/content-state';
import { PresentationService } from '@arsnova/app/services/util/presentation.service';

@Injectable()
class MockContentService {
  getContentsByIds() {
    return of([new Content('1234', '0', '1', 'subject', 'body', [], ContentType.CHOICE, {}, new ContentState(1, new Date(), true))]);
  }

  getSupportedContents(){
    return [];
  }
}

@Injectable()
class MockRoomService {
}

@Injectable()
class MockContentGroupService {
  getByRoomIdAndName() {
    return of(new ContentGroup('1234', '0', 'roomId', 'name', [], true));
  }
}

@Injectable()
class MockDialogService {
}

@Injectable()
class MockHotykeyService {
}

describe('ContentPresentationComponent', () => {
  let component: ContentPresentationComponent;
  let fixture: ComponentFixture<ContentPresentationComponent>;

  const data = {
    room: new Room('1234', 'shortId', 'abbreviation', 'name', 'description')
  }

  const snapshot = new ActivatedRouteSnapshot();

  snapshot.params = of([{seriesName: 'SERIES'}]);

  const activatedRouteStub = new ActivatedRouteStub(null,data, snapshot);

  const mockPresentationService = jasmine.createSpyObj(['getScale']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentPresentationComponent ],
      providers: [
        {
          provide: ContentService,
          useClass: MockContentService
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
          provide: Router,
          useClass: MockRouter
        },
        {
          provide: HotkeyService,
          useClass: MockHotykeyService
        },
        {
          provide: PresentationService,
          useValue: mockPresentationService
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
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentPresentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
