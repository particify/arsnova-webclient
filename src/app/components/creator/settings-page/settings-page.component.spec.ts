import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SettingsPageComponent } from './settings-page.component';
import { RoomService } from '@arsnova/app/services/http/room.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ActivatedRouteStub,
  JsonTranslationLoader,
  MockEventService,
  MockGlobalStorageService,
  MockLangService,
  MockRouter,
} from '@arsnova/testing/test-helpers';
import { EventService } from '@arsnova/app/services/util/event.service';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA, Injectable } from '@angular/core';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';
import { LanguageService } from '@arsnova/app/services/util/language.service';
import { A11yIntroPipe } from '@arsnova/app/pipes/a11y-intro.pipe';

@Injectable()
class MockRoomService {}

describe('SettingsPageComponent', () => {
  let component: SettingsPageComponent;
  let fixture: ComponentFixture<SettingsPageComponent>;

  const data = {
    room: {
      id: '1234',
    },
  };

  const activatedRouteStub = new ActivatedRouteStub(null, data);

  let translateService: TranslateService;

  const a11yIntroPipe = new A11yIntroPipe(translateService);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SettingsPageComponent, A11yIntroPipe],
      providers: [
        {
          provide: RoomService,
          useClass: MockRoomService,
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: EventService,
          useClass: MockEventService,
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
          provide: LanguageService,
          useClass: MockLangService,
        },
        {
          provide: A11yIntroPipe,
          useValue: a11yIntroPipe,
        },
      ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
