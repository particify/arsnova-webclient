import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PublishContentGroupDialogComponent } from './publish-content-group-dialog.component';
import { MockMatDialogRef } from '@testing/test-helpers';
import { ContentGroup } from '@app/core/models/content-group';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';

describe('PublishContentGroupDialogComponent', () => {
  let component: PublishContentGroupDialogComponent;
  let fixture: ComponentFixture<PublishContentGroupDialogComponent>;

  const mockContentGroupService = jasmine.createSpyObj('ContentGroupService', [
    'patchContentGroup',
  ]);

  const contentPublishService = jasmine.createSpyObj(ContentPublishService, [
    'isGroupLive',
  ]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PublishContentGroupDialogComponent],
      imports: [BrowserAnimationsModule, getTranslocoModule()],
      providers: [
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { contentGroup: new ContentGroup() },
        },
        {
          provide: ContentGroupService,
          useValue: mockContentGroupService,
        },
        {
          provide: ContentPublishService,
          useValue: contentPublishService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PublishContentGroupDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
