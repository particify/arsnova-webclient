import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoomJoinComponent } from './room-join.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '@app/core/services/util/notification.service';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { EventService } from '@app/core/services/util/event.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  ActivatedRouteStub,
  MockEventService,
  MockGlobalStorageService,
} from '@testing/test-helpers';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatInputHarness } from '@angular/material/input/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { SplitShortIdPipe } from '@app/core/pipes/split-short-id.pipe';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AutofocusDirective } from '@app/core/directives/autofocus.directive';

export class MockAuthenticationService {
  private auth$$ = new BehaviorSubject<any>({});

  getAuthenticationChanges() {
    return this.auth$$.asObservable();
  }
}

describe('RoomJoinComponent', () => {
  let component: RoomJoinComponent;
  let fixture: ComponentFixture<RoomJoinComponent>;
  const activatedRoute = new ActivatedRouteStub();
  const notificationService = jasmine.createSpyObj('NotificationService', [
    'showAdvanced',
  ]);
  const router = jasmine.createSpyObj('Router', ['navigate']);
  let loader: HarnessLoader;
  let joinButton: MatButtonHarness;
  let inputField: MatInputHarness;
  const splitShortIdPipe = new SplitShortIdPipe();

  beforeEach(async () => {
    router.navigate.calls.reset();
    notificationService.showAdvanced.calls.reset();

    TestBed.configureTestingModule({
      declarations: [RoomJoinComponent, SplitShortIdPipe, AutofocusDirective],
      imports: [
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        MatIconModule,
        FormsModule,
        getTranslocoModule(),
        HttpClientTestingModule,
      ],
      providers: [
        {
          provide: Router,
          useValue: router,
        },
        {
          provide: NotificationService,
          useValue: notificationService,
        },
        {
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
        {
          provide: AuthenticationService,
          useClass: MockAuthenticationService,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRoute,
        },
        {
          provide: SplitShortIdPipe,
          useValue: splitShortIdPipe,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomJoinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
    inputField = await loader.getHarness(
      MatInputHarness.with({ selector: '#room-id-input' })
    );
    joinButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '#join-button' })
    );
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

  it('should be display warning notification if the entered room code is shorter than 8 digits', async () => {
    await inputField.setValue('1');
    await joinButton.click();
    expect(notificationService.showAdvanced).toHaveBeenCalledWith(
      'home-page.exactly-8',
      'WARNING'
    );
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should be display warning notification if the entered room code is longer than 8 digits', async () => {
    await inputField.setValue('1111111111');
    await joinButton.click();
    expect(notificationService.showAdvanced).toHaveBeenCalledWith(
      'home-page.exactly-8',
      'WARNING'
    );
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should be display warning notification if the entered input not only contains numbers', async () => {
    await inputField.setValue('A');
    expect(notificationService.showAdvanced).toHaveBeenCalledWith(
      'home-page.only-numbers',
      'WARNING'
    );
  });

  it('should be route to room view if entered a 8 digit room number', async () => {
    const roomIdToEnter = '12345678';
    await inputField.setValue(roomIdToEnter);
    await joinButton.click();
    expect(notificationService.showAdvanced).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['p', roomIdToEnter]);
  });
});
