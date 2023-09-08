import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeriesTitleComponent } from './series-title.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { CoreModule } from '@angular/flex-layout';
import { NotificationService } from '@app/core/services/util/notification.service';
import { MockNotificationService } from '@testing/test-helpers';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('SeriesTitleComponent', () => {
  let component: SeriesTitleComponent;
  let fixture: ComponentFixture<SeriesTitleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SeriesTitleComponent],
      imports: [CoreModule, getTranslocoModule()],
      providers: [
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(SeriesTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
