import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePageComponent } from './home-page.component';
import { Injectable, Renderer2, Component, Input } from '@angular/core';
import { EventService } from '../../../services/util/event.service';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { DialogService } from '../../../services/util/dialog.service';
import { GlobalStorageService } from '../../../services/util/global-storage.service';
import { AnnounceService } from '../../../services/util/announce.service';

const TRANSLATION_DE = require('../../../../assets/i18n/home/de.json');
const TRANSLATION_EN = require('../../../../assets/i18n/home/en.json');

const TRANSLATIONS = {
  DE: TRANSLATION_DE,
  EN: TRANSLATION_EN
};

class JsonTranslationLoader implements TranslateLoader {
  getTranslation(code: string = ''): Observable<object> {
      const uppercased = code.toUpperCase();

      return of(TRANSLATIONS[uppercased]);
  }
}

@Injectable()
class MockEventService {
  public makeFocusOnInputFalse() {

  }
}

@Injectable()
class MockDialogService {

}

@Injectable()
class MockAnnouncer {

}

@Injectable()
class MockRenderer2 {

}

@Injectable()
class MockMatDialog {

}

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

@Component({ selector: 'app-room-join', template: '' })
class RoomJoinStubComponent {
  @Input() inputA11yString;
}

@Component({ selector: 'mat-icon', template: '' })
class MatIconStubComponent {}

describe('HomePageComponent', () => {
  let component: HomePageComponent;
  let fixture: ComponentFixture<HomePageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        HomePageComponent,
        RoomJoinStubComponent,
        MatIconStubComponent
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
      providers: [
        {
          provide: EventService,
          useClass: MockEventService
        },
        {
          provide: AnnounceService,
          useClass: MockAnnouncer
        },
        {
          provide: Renderer2,
          useClass: MockRenderer2
        },
        {
          provide: MatDialog,
          useClass: MockMatDialog
        },
        {
          provide: DialogService,
          useClass: MockDialogService
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService
        },
      ]
    }).compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(HomePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
