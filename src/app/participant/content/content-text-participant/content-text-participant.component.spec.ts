import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ContentTextParticipantComponent } from './content-text-participant.component';
import { Router } from '@angular/router';
import { NotificationService } from '@app/core/services/util/notification.service';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import {
  MockNotificationService,
  MockGlobalStorageService,
  MockRouter,
} from '@testing/test-helpers';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { NO_ERRORS_SCHEMA, EventEmitter } from '@angular/core';
import { ContentType } from '@app/core/models/content-type.enum';
import { Content } from '@app/core/models/content';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ContentTextParticipantComponent', () => {
  let component: ContentTextParticipantComponent;
  let fixture: ComponentFixture<ContentTextParticipantComponent>;

  const mockContentAnswerService = jasmine.createSpyObj(['addAnswerText']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        getTranslocoModule(),
        ContentTextParticipantComponent,
        BrowserAnimationsModule,
      ],
      providers: [
        {
          provide: ContentAnswerService,
          useValue: mockContentAnswerService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentTextParticipantComponent);
    component = fixture.componentInstance;
    component.content = new Content(
      '1234',
      'subject',
      'body',
      [],
      ContentType.TEXT
    );
    component.sendEvent = new EventEmitter<string>();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
