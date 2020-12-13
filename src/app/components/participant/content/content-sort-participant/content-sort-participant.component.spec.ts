/*
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentSortParticipantComponent } from './content-sort-participant.component';
import { EventEmitter, Injectable } from '@angular/core';
import { ContentAnswerService } from '../../../../services/http/content-answer.service';
import { NotificationService } from '../../../..//services/util/notification.service';
import { Observable, of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '@arsnova/app/services/http/authentication.service';
import { LanguageService } from '@arsnova/app/services/util/language.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';

@Injectable()
class MockContentAnswerService {

}

@Injectable()
class MockNotificationService {

}

@Injectable()
class MockTranslateService {
  public get(key: string): Observable<String> {
    return of (key);
  }

  public use(key: string): void {

  }
}

@Injectable()
class MockAuthenticationService {
  getCurrentAuthentication() {
    return of(null);
  }
}

@Injectable()
class MockLanguageService {
  public readonly langEmitter = new EventEmitter<string>();
}

@Injectable()
class MockGlobalStorageService {
  public getItem(key: string): string {
    return '';
  }

  public setItem(key: string, value: any) {
  }

  public removeItem(key: string) {
  }
}

@Injectable()
class MockRouter {

}

describe('ContentSortParticipantComponent', () => {
  let component: ContentSortParticipantComponent;
  let fixture: ComponentFixture<ContentSortParticipantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContentSortParticipantComponent ],
      providers: [
        {
          provide: ContentAnswerService,
          useClass: MockContentAnswerService
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService
        },
        {
          provide: TranslateService,
          useClass: MockTranslateService
        },
        {
          provide: AuthenticationService,
          useClass: MockAuthenticationService
        },
        {
          provide: LanguageService,
          useClass: MockLanguageService
        },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of([{ id: 1 }]),
            data: of()
          },
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService
        },
        {
          provide: Router,
          useClass: MockRouter
        }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentSortParticipantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
*/
