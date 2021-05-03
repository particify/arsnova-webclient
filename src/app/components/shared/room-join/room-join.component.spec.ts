import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoomJoinComponent } from './room-join.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../services/util/notification.service';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { EventService } from '../../../services/util/event.service';
import { GlobalStorageService } from '../../../services/util/global-storage.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  ActivatedRouteStub,
  JsonTranslationLoader,
  MockEventService, MockGlobalStorageService
} from '@arsnova/testing/test-helpers';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatInputHarness } from '@angular/material/input/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { FormsModule } from '@angular/forms';

export class MockAuthenticationService {
  private auth$$ = new BehaviorSubject<any>({});

  getAuthenticationChanges() {
    return this.auth$$.asObservable();
  }
}

describe('RoomJoinComponent', () => {
  let component: RoomJoinComponent;
  let fixture: ComponentFixture<RoomJoinComponent>;
  const activatedRoute = new ActivatedRouteStub(null, { apiConfig: { ui: { demo: '27273589' } } });
  let notificationService = jasmine.createSpyObj('NotificationService', ['showAdvanced']);
  let router = jasmine.createSpyObj('Router', ['navigate']);
  let loader: HarnessLoader;
  let joinButton: MatButtonHarness;
  let inputField: MatInputHarness;

  beforeEach(async () => {

    router.navigate.calls.reset();
    notificationService.showAdvanced.calls.reset();

    TestBed.configureTestingModule({
      declarations: [
        RoomJoinComponent
      ],
      imports: [
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        MatIconModule,
        FormsModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader
          },
          isolate: true
        }),
        HttpClientTestingModule
      ],
      providers: [
        {
          provide: Router,
          useValue: router
        },
        {
          provide: NotificationService,
          useValue: notificationService
        },
        {
          provide: EventService,
          useClass: MockEventService
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService
        },
        {
          provide: AuthenticationService,
          useClass: MockAuthenticationService
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRoute
        }
      ]
    }).compileComponents();

      fixture = TestBed.createComponent(RoomJoinComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixture);
      inputField = await loader.getHarness(MatInputHarness.with({selector: '#room-id-input'}));
      joinButton = await loader.getHarness(MatButtonHarness.with({selector: '#join-button'}));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be able to load join button', async () => {
    expect(joinButton).not.toBeNull();
  });

  it('should be able to load input field', async () => {
    expect(inputField).not.toBeNull();
  });

  it('should navigate to demo session if there is no input', async () => {
    expect(component.demoId).not.toBeNull();
    const joinButton = await loader.getHarness(MatButtonHarness.with({selector: '#join-button'}));
    await joinButton.click();
    expect(router.navigate).toHaveBeenCalledWith(['participant', 'room', component.demoId]);
  });

  it('should be display warning notification if the entered room code is shorter than 8 digits', async () => {
    await inputField.setValue('1');
    await joinButton.click();
    expect(notificationService.showAdvanced).toHaveBeenCalledWith('home-page.exactly-8', 'WARNING');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should be display warning notification if the entered room code is longer than 8 digits', async () => {
    await inputField.setValue('1111111111');
    await joinButton.click();
    expect(notificationService.showAdvanced).toHaveBeenCalledWith('home-page.exactly-8', 'WARNING');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should be display warning notification if the entered input not only contains numbers', async () => {
    await inputField.setValue('ABCDEFGH');
    await joinButton.click();
    expect(notificationService.showAdvanced).toHaveBeenCalledWith('home-page.only-numbers', 'WARNING');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should be route to room view if entered a 8 digit room number', async () => {
    const roomIdToEnter = '12345678';
    await inputField.setValue(roomIdToEnter);
    await joinButton.click();
    expect(notificationService.showAdvanced).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['participant', 'room', roomIdToEnter]);
  });
});
