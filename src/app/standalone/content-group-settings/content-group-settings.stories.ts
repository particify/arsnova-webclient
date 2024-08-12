import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';

import { ContentGroupSettingsComponent } from '@app/standalone/content-group-settings/content-group-settings.component';
import { importProvidersFrom } from '@angular/core';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { SettingsSlideToggleComponent } from '@app/standalone/settings-slide-toggle/settings-slide-toggle.component';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import {
  ContentGroup,
  GroupType,
  PublishingMode,
} from '@app/core/models/content-group';

class MockDialogRef {
  close() {}
}

class MockContentGroupService {
  patchContentGroup() {
    return of(new ContentGroup());
  }
}

export default {
  component: ContentGroupSettingsComponent,
  title: 'ContentGroupSettings',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [
        ContentGroupSettingsComponent,
        SettingsSlideToggleComponent,
        LoadingIndicatorComponent,
        LoadingButtonComponent,
        BrowserAnimationsModule,
      ],
      providers: [
        ContentPublishService,
        {
          provide: ContentGroupService,
          useClass: MockContentGroupService,
        },
        {
          provide: MatDialogRef,
          useClass: MockDialogRef,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            contentGroup: new ContentGroup(
              'roomId',
              'My awesome quiz',
              ['content1', 'content2', 'content3', 'content4', 'content5'],
              true,
              true,
              true,
              PublishingMode.LIVE,
              0,
              GroupType.QUIZ,
              true
            ),
          },
        },
      ],
    }),
    applicationConfig({
      providers: [
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentGroupSettingsComponent>;

export const ContentGroupSettings: Story = {};
