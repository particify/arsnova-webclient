import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentGroupSettingsComponent } from './content-group-settings.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MockMatDialogRef } from '@testing/test-helpers';
import { ContentGroup } from '@app/core/models/content-group';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';

describe('ContentGroupSettingsComponent', () => {
  let component: ContentGroupSettingsComponent;
  let fixture: ComponentFixture<ContentGroupSettingsComponent>;

  const dialogData = {
    contentGroup: new ContentGroup(),
    groupNames: [],
  };

  const mockContentGroupService = jasmine.createSpyObj(ContentGroupService, [
    'patchContentGroup',
  ]);

  const contentPublishService = jasmine.createSpyObj(ContentPublishService, [
    'isGroupLive',
  ]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ContentGroupSettingsComponent,
        getTranslocoModule(),
        BrowserAnimationsModule,
      ],
      providers: [
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: dialogData,
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
    }).compileComponents();

    fixture = TestBed.createComponent(ContentGroupSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
