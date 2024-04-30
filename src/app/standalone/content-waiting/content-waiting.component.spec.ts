import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ContentWaitingComponent } from './content-waiting.component';
import { RoomUserAliasService } from '@app/core/services/http/room-user-alias.service';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { of } from 'rxjs';

describe('ContentWaitingComponent', () => {
  let component: ContentWaitingComponent;
  let fixture: ComponentFixture<ContentWaitingComponent>;

  const mockAuthenticationService = jasmine.createSpyObj([
    'getCurrentAuthentication',
  ]);

  const mockRoomUserAliasService = jasmine.createSpyObj(
    'RoomUserAliasService',
    ['updateAlias']
  );
  mockRoomUserAliasService.updateAlias.and.returnValue(
    of({ id: 'aliasId', alias: 'alias', seed: 1234 })
  );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentWaitingComponent, getTranslocoModule()],
      providers: [
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService,
        },
        {
          provide: RoomUserAliasService,
          useValue: mockRoomUserAliasService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentWaitingComponent);
    component = fixture.componentInstance;
    component.alias = { id: 'aliasId', alias: 'alias', seed: 1234 };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
