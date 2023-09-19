import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContentWordcloudCreationComponent } from './content-wordcloud-creation.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NotificationService } from '@app/core/services/util/notification.service';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { MockNotificationService } from '@testing/test-helpers';
describe('ContentWordcloudCreationComponent', () => {
  let component: ContentWordcloudCreationComponent;
  let fixture: ComponentFixture<ContentWordcloudCreationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentWordcloudCreationComponent],
      providers: [
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
      ],
      imports: [getTranslocoModule()],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ContentWordcloudCreationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
