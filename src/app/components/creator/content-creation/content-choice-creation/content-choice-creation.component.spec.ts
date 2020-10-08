import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContentChoiceCreationComponent } from './content-choice-creation.component';
import { Component, Injectable, Input } from '@angular/core';
import { ContentService } from '../../../../services/http/content.service';
import { NotificationService } from '../../../../services/util/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { EventService } from '../../../../services/util/event.service';
import { RoomService } from '../../../../services/http/room.service';
import { Observable, of, Subject } from 'rxjs';
import { DialogService } from '../../../../services/util/dialog.service';
import { GlobalStorageService } from '../../../../services/util/global-storage.service';
import { ContentGroupService } from '../../../../services/http/content-group.service';
import { MatButtonModule } from '@angular/material/button';

const TRANSLATION_DE = require('../../../../../assets/i18n/home/de.json');
const TRANSLATION_EN = require('../../../../../assets/i18n/home/en.json');

const TRANSLATIONS = {
  DE: TRANSLATION_DE,
  EN: TRANSLATION_EN
};

class JsonTranslationLoader implements TranslateLoader {
  getTranslation(code: string = ''): Observable<object> {
    if (code !== null) {
      const uppercased = code.toUpperCase();

      return of(TRANSLATIONS[uppercased]);
    } else {
      return of({});
    }
  }
}

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
class MockDialogService {

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

@Component({ selector: 'mat-icon', template: '' })
class MatIconStubComponent { }

@Component({ selector: 'mat-form-field', template: '' })
class MatFormFieldStubComponent { }

@Component({ selector: 'mat-checkbox', template: '' })
class MatCheckboxStubComponent {
  @Input() checked: boolean;
  @Input() ngModel: any;
  @Input() name: string;
  @Input('aria-label') ariaLabel: any;
}

@Component({ selector: 'mat-list', template: '' })
class MatListStubComponent { }

@Component({ selector: 'mat-list-item', template: '' })
class MatListItemStubComponent { }

@Component({ selector: 'mat-radio-group', template: '' })
class MatRadioGroupStubComponent {
  @Input() ngModel;
  @Input() ngModelOptions;
}

@Component({ selector: 'mat-radio-button', template: '' })
class MatRadioButtonStubComponent {
  @Input() value;
  @Input() checked;
}

@Component({ selector: 'mat-divider', template: '' })
class MatDividerStubComponent { }

@Component({ selector: 'mat-label', template: '' })
class MatLabelStubComponent { }

@Component({ selector: 'mat-card', template: '' })
class MatCardStubComponent { }

@Component({ selector: 'mat-placeholder', template: '' })
class MatPlaceholderStubComponent { }

@Component({ selector: 'input', template: '' })
class InputStubComponent {
  @Input() ngModel;
}

describe('ContentChoiceCreationComponent', () => {
  let component: ContentChoiceCreationComponent;
  let fixture: ComponentFixture<ContentChoiceCreationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ContentChoiceCreationComponent,
        MatIconStubComponent,
        MatFormFieldStubComponent,
        MatCheckboxStubComponent,
        MatListStubComponent,
        MatListItemStubComponent,
        MatRadioGroupStubComponent,
        MatRadioButtonStubComponent,
        MatDividerStubComponent,
        MatLabelStubComponent,
        MatCardStubComponent,
        MatPlaceholderStubComponent,
        InputStubComponent
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
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService
        },
        {
          provide: ContentGroupService,
          useClass: MockContentGroupService
        },
      ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader
          },
          isolate: true
        }),
        MatButtonModule
      ],
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
