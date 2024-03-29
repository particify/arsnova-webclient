import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationService } from '@app/core/services/util/notification.service';
import { MockNotificationService } from '@testing/test-helpers';
import { getTranslocoModule } from '@testing/transloco-testing.module';

import { CopyUrlComponent } from './copy-url.component';

describe('CopyRoomUrlComponent', () => {
  let component: CopyUrlComponent;
  let fixture: ComponentFixture<CopyUrlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CopyUrlComponent, getTranslocoModule()],
      providers: [
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CopyUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
