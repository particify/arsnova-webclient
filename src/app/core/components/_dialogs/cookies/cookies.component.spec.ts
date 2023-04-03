import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CookiesComponent } from './cookies.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {
  JsonTranslationLoader,
  MockNotificationService,
  MockMatDialogRef,
  ActivatedRouteStub,
} from '@testing/test-helpers';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '@app/core/services/util/notification.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('CookiesComponent', () => {
  let component: CookiesComponent;
  let fixture: ComponentFixture<CookiesComponent>;

  const activatedRouteStub = new ActivatedRouteStub();

  const dialogData = {
    categories: [
      {
        key: 'cat-1',
        id: '1',
        required: true,
        consent: false,
      },
      {
        key: 'cat-2',
        id: '2',
        required: false,
        consent: false,
      },
      {
        key: 'cat-3',
        id: '3',
        required: false,
        consent: false,
      },
    ],
    privacyUrl: 'privacy',
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CookiesComponent],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CookiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
