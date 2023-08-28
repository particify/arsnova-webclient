import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContentChoiceCreationComponent } from './content-choice-creation.component';
import { Component, NO_ERRORS_SCHEMA, Injectable, Input } from '@angular/core';
import { ContentService } from '@app/core/services/http/content.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { EventService } from '@app/core/services/util/event.service';
import { RoomService } from '@app/core/services/http/room.service';
import { of, Subject } from 'rxjs';
import { DialogService } from '@app/core/services/util/dialog.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { MatButtonModule } from '@angular/material/button';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import {
  ActivatedRouteStub,
  JsonTranslationLoader,
  MockMatDialog,
} from '@testing/test-helpers';

const mockCreateEvent = new Subject<any>();

@Injectable()
class MockContentService {}

@Injectable()
class MockNotificationService {}

@Injectable()
class MockEventService {}

@Injectable()
class MockRoomService {}

@Injectable()
class MockDialogService {}

@Injectable()
class MockContentGroupService {}

@Injectable()
class MockAnnouncer {}

/* eslint-disable @angular-eslint/component-selector */
@Component({ selector: 'mat-icon', template: '' })
class MatIconStubComponent {}

@Component({ selector: 'mat-form-field', template: '' })
class MatFormFieldStubComponent {}

@Component({ selector: 'mat-checkbox', template: '' })
class MatCheckboxStubComponent {
  @Input() checked: boolean;
  @Input() ngModel: any;
  @Input() name: string;
  @Input('aria-label') ariaLabel: any;
}

@Component({ selector: 'mat-list', template: '' })
class MatListStubComponent {}

@Component({ selector: 'mat-list-item', template: '' })
class MatListItemStubComponent {}

@Component({ selector: 'mat-divider', template: '' })
class MatDividerStubComponent {}

@Component({ selector: 'mat-label', template: '' })
class MatLabelStubComponent {}

@Component({ selector: 'mat-card', template: '' })
class MatCardStubComponent {}

@Component({ selector: 'mat-placeholder', template: '' })
class MatPlaceholderStubComponent {}

/* eslint-enable @angular-eslint/component-selector */

describe('ContentChoiceCreationComponent', () => {
  let component: ContentChoiceCreationComponent;
  let fixture: ComponentFixture<ContentChoiceCreationComponent>;

  const data = {
    room: {
      id: '1234',
    },
  };

  const snapshot = new ActivatedRouteSnapshot();

  snapshot.params = of([{ seriesName: 'SERIES' }]);

  const activatedRouteStub = new ActivatedRouteStub(undefined, data, snapshot);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ContentChoiceCreationComponent,
        MatIconStubComponent,
        MatFormFieldStubComponent,
        MatCheckboxStubComponent,
        MatListStubComponent,
        MatListItemStubComponent,
        MatDividerStubComponent,
        MatLabelStubComponent,
        MatCardStubComponent,
        MatPlaceholderStubComponent,
      ],
      providers: [
        {
          provide: DialogService,
          useClass: MockDialogService,
        },
        {
          provide: ContentService,
          useClass: MockContentService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: MatDialog,
          useClass: MockMatDialog,
        },
        {
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: RoomService,
          useClass: MockRoomService,
        },
        {
          provide: ContentGroupService,
          useClass: MockContentGroupService,
        },
        {
          provide: AnnounceService,
          useClass: MockAnnouncer,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
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
        MatButtonModule,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ContentChoiceCreationComponent);
        component = fixture.componentInstance;
        component.createEvent = mockCreateEvent;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
