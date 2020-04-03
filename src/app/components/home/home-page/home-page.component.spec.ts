import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePageComponent } from './home-page.component';
import { Injectable, Renderer2, Component, Input } from '@angular/core';
import { EventService } from '../../../services/util/event.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { DialogService } from '../../../services/util/dialog.service';

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
class MockLiveAnnouncer {

}

@Injectable()
class MockRenderer2 {

}

@Injectable()
class MockMatDialog {

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
          provide: LiveAnnouncer,
          useClass: MockLiveAnnouncer
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
        }
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
