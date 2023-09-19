import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentGroupTitleComponent } from './content-group-title.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { CoreModule } from '@angular/flex-layout';
import { NotificationService } from '@app/core/services/util/notification.service';
import { MockNotificationService } from '@testing/test-helpers';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ContentGroupTitleComponent', () => {
  let component: ContentGroupTitleComponent;
  let fixture: ComponentFixture<ContentGroupTitleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ContentGroupTitleComponent],
      imports: [CoreModule, getTranslocoModule()],
      providers: [
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(ContentGroupTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
