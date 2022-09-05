import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePageComponent } from './home-page.component';
import { Component, NO_ERRORS_SCHEMA, Input, Pipe, PipeTransform, Renderer2 } from '@angular/core';
import { EventService } from '../../../services/util/event.service';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { DialogService } from '../../../services/util/dialog.service';
import { GlobalStorageService } from '../../../services/util/global-storage.service';
import { AnnounceService } from '../../../services/util/announce.service';
import {
  ActivatedRouteStub,
  JsonTranslationLoader,
  MockAnnounceService,
  MockEventService,
  MockGlobalStorageService, MockRenderer2
} from '../../../../testing/test-helpers';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Observable, of } from 'rxjs';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';

@Component({ selector: 'app-room-join', template: '' })
class RoomJoinStubComponent {
  @Input() inputA11yString;
}

@Component({
// eslint-disable-next-line @angular-eslint/component-selector
  selector: 'lib-extension-point',
  template: '<svg>Particify</svg>'
})
class LibExtensionPointStubComponent {
  @Input() extensionId: string;
}

@Pipe({name: 'a11yIntro'})
class MockA11yIntroPipe implements PipeTransform {
  transform(i18nKey: string, args?: object): Observable<string> {
    return of(i18nKey);
  }
}

describe('HomePageComponent', () => {
  let component: HomePageComponent;
  let fixture: ComponentFixture<HomePageComponent>;

  let dialogService = jasmine.createSpyObj('DialogService', ['openRoomCreateDialog']);

  let logo: HTMLElement;
  let header: HTMLElement;

  let loader: HarnessLoader;
  let newRoomButton: MatButtonHarness;

  const data = {
    apiConfig: {
      ui: {
        registration: {
          service: 'ARSnova'
        }
      }
    }
  };

  const snapshot = new ActivatedRouteSnapshot();
  snapshot.data = data;

  const activatedRouteStub = new ActivatedRouteStub(null, null, snapshot);

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [
        HomePageComponent,
        RoomJoinStubComponent,
        LibExtensionPointStubComponent,
        MockA11yIntroPipe
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
          useClass: MockAnnounceService
        },
        {
          provide: Renderer2,
          useClass: MockRenderer2
        },
        {
          provide: DialogService,
          useValue: dialogService
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub
        }
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;
    dialogService = TestBed.inject(DialogService);
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
    logo = fixture.nativeElement.querySelector('svg');
    header = fixture.nativeElement.querySelector('h1');
    newRoomButton = await loader.getHarness(MatButtonHarness.with({selector: '#new-room-button'}));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display particify logo or arsnova header', () => {
    const expected = (!!logo && !header) || (!!header && !logo);
    expect(expected).toBe(true);
  });

  it('should open room creation dialog after clicking button', async() => {
    expect(dialogService.openRoomCreateDialog).not.toHaveBeenCalled();
    await newRoomButton.click();
    expect(dialogService.openRoomCreateDialog).toHaveBeenCalled();
  });
});
