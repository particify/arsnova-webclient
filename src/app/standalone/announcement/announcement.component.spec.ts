import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTranslocoModule } from '@testing/transloco-testing.module';

import { AnnouncementComponent } from './announcement.component';
import { UserAnnouncement } from '@app/core/models/user-announcement';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { of } from 'rxjs';

describe('AnnouncementComponent', () => {
  let component: AnnouncementComponent;
  let fixture: ComponentFixture<AnnouncementComponent>;

  const mockFormattingService = jasmine.createSpyObj(['postString']);
  mockFormattingService.postString.and.returnValue(of('rendered'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [getTranslocoModule(), AnnouncementComponent],
      providers: [
        {
          provide: FormattingService,
          useValue: mockFormattingService,
        },
      ],
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
