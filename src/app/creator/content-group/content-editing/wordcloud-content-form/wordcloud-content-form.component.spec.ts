import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WordcloudContentFormComponent } from './wordcloud-content-form.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NotificationService } from '@app/core/services/util/notification.service';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { MockNotificationService } from '@testing/test-helpers';
describe('WordcloudContentFormComponent', () => {
  let component: WordcloudContentFormComponent;
  let fixture: ComponentFixture<WordcloudContentFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
      ],
      imports: [getTranslocoModule(), WordcloudContentFormComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(WordcloudContentFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
