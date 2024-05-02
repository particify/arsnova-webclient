import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateFormatPipe } from '@app/core/pipes/date-format.pipe';
import { getTranslocoModule } from '@testing/transloco-testing.module';

import { AnnouncementComponent } from './announcement.component';
import { UserAnnouncement } from '@app/core/models/user-announcement';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AnnouncementComponent', () => {
  let component: AnnouncementComponent;
  let fixture: ComponentFixture<AnnouncementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DateFormatPipe],
      imports: [getTranslocoModule(), AnnouncementComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AnnouncementComponent);
    component = fixture.componentInstance;
    component.announcement = new UserAnnouncement(
      '1234',
      'title',
      'body',
      'roomName'
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
