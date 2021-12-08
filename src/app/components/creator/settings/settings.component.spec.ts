import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import {
  ActivatedRouteStub,
  JsonTranslationLoader,
  MockEventService,
  MockMatDialog,
  MockNotificationService,
  MockRouter
} from '@arsnova/testing/test-helpers';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { RoomService } from '@arsnova/app/services/http/room.service';
import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { EventService } from '@arsnova/app/services/util/event.service';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { MockLocationStrategy } from '@angular/common/testing';
import { of } from 'rxjs';
import { RoomComponent } from '@arsnova/app/components/creator/settings/room/room.component';

@Injectable()
class MockRoomService {
}

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  const snapshot = new ActivatedRouteSnapshot();

  snapshot.params = of([{settingsName: 'general'}]);

  const activatedRouteStub = new ActivatedRouteStub(null, null, snapshot);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsComponent ],
      providers: [
        {
          provide: MatDialog,
          useClass: MockMatDialog
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService
        },
        {
          provide: RoomService,
          useClass: MockRoomService
        },
        {
          provide: Router,
          useClass: MockRouter
        },
        {
          provide: Location,
          useClass: MockLocationStrategy
        },
        {
          provide: EventService,
          useClass: MockEventService
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub
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
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    component.settings = {headerName: 'general', iconName: 'settings', componentName: 'RoomComponent', hotkey: '1'};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
})
