import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterLinksComponent } from './footer-links.component';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { ConsentService } from '@app/core/services/util/consent.service';
import { getTranslocoModule } from '@testing/transloco-testing.module';

describe('FooterLinksComponent', () => {
  let component: FooterLinksComponent;
  let fixture: ComponentFixture<FooterLinksComponent>;

  const authenticationService = jasmine.createSpyObj('AuthenticationService', [
    'hasAdminRole',
  ]);
  authenticationService.hasAdminRole.and.returnValue(true);

  const consentService = jasmine.createSpyObj('ConsentService', ['openDialog']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterLinksComponent, getTranslocoModule()],
      providers: [
        {
          provide: AuthenticationService,
          useValue: authenticationService,
        },
        {
          provide: ConsentService,
          useValue: consentService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterLinksComponent);
    component = fixture.componentInstance;
    component.uiConfig = {
      links: {
        privacy: {
          url: 'privacy',
        },
        imprint: {
          url: 'imprint',
        },
        feedback: {
          url: 'feedback',
        },
      },
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
