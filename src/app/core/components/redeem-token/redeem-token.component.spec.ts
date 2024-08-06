import { NO_ERRORS_SCHEMA, Injectable } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthProvider } from '@app/core/models/auth-provider';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { RoomMembershipService } from '@app/core/services/room-membership.service';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { MockRouter } from '@testing/test-helpers';
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RedeemTokenComponent],
      providers: [
        {
          provide: Router,
          useClass: MockRouter,
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
