import { NO_ERRORS_SCHEMA, Injectable } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
import { AuthProvider } from '@core/models/auth-provider';
import { ClientAuthentication } from '@core/models/client-authentication';
import { RoomMembershipService } from '@core/services/room-membership.service';
import { AuthenticationService } from '@core/services/http/authentication.service';
import { RoutingService } from '@core/services/util/routing.service';
import { ActivatedRouteStub, MockRouter } from '@testing/test-helpers';
import { of } from 'rxjs';
import { RedeemTokenComponent } from './redeem-token.component';

@Injectable()
class MockAuthenticationService {
  getAuthenticationChanges() {
    return of(
      new ClientAuthentication('1234', 'a@b.cd', AuthProvider.ARSNOVA, 'token')
    );
  }
}

@Injectable()
class MockRoomMembershipService {
  requestMembership() {
    return of({});
  }
}

describe('RedeemTokenComponent', () => {
  let component: RedeemTokenComponent;
  let fixture: ComponentFixture<RedeemTokenComponent>;

  const mockRoutingService = jasmine.createSpyObj(['setRedirect']);

  const snapshot = new ActivatedRouteSnapshot();

  snapshot.params = of([
    {
      roomId: 'roomId',
      token: 'token',
    },
  ]);

  const activatedRouteStub = new ActivatedRouteStub(null, null, snapshot);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RedeemTokenComponent],
      providers: [
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
        {
          provide: RoutingService,
          useValue: mockRoutingService,
        },
        {
          provide: AuthenticationService,
          useClass: MockAuthenticationService,
        },
        {
          provide: RoomMembershipService,
          useClass: MockRoomMembershipService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RedeemTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
