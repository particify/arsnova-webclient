import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';

import { ContentGroupTemplatePreviewComponent } from './content-group-template-preview.component';
import { importProvidersFrom } from '@angular/core';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { HttpClientModule } from '@angular/common/http';
import { BaseTemplateService } from '@app/core/services/http/base-template.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { ActivatedRoute } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ContentGroupTemplate } from '@app/core/models/content-group-template';
import { ContentService } from '@app/core/services/http/content.service';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { ApiConfig } from '@app/core/models/api-config';
import { RoomMembershipService } from '@app/core/services/room-membership.service';
import { Content } from '@app/core/models/content';
import { ContentType } from '@app/core/models/content-type.enum';
import { AddTemplateButtonComponent } from '@app/standalone/add-template-button/add-template-button.component';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { DialogService } from '@app/core/services/util/dialog.service';

class MockService {}

class MockTemplateService {
  getContentGroupTemplate() {
    return of(
      new ContentGroupTemplate(
        'Template name',
        'This is a description.',
        'en',
        [
          { id: 'tagId1', name: 'tag 1', verified: true },
          { id: 'tagId2', name: 'tag 2', verified: true },
          { id: 'tagId3', name: 'tag 3', verified: true },
        ],
        'CC-BY-4.0',
        false,
        'Attribution',
        ['templateId1', 'templateId2', 'templateId3', 'templateId4']
      )
    );
  }

  getContentTemplates() {
    return of([
      new Content('roomId', 'subject', 'content1', [], ContentType.TEXT),
      new Content('roomId', 'subject', 'content2', [], ContentType.CHOICE),
      new Content('roomId', 'subject', 'content3', [], ContentType.SCALE),
      new Content('roomId', 'subject', 'content4', [], ContentType.WORDCLOUD),
    ]);
  }
}

class MockApiConfigService {
  getApiConfig$() {
    return of(new ApiConfig([], {}, {}));
  }
}

class MockRoutingService {
  getRoute() {
    return 'https://link-to-template/templateId1';
  }
}

class MockContentService {
  getTypeIcons() {
    return new Map<ContentType, string>([
      [ContentType.CHOICE, 'list'],
      [ContentType.SCALE, 'mood'],
      [ContentType.BINARY, 'rule'],
      [ContentType.TEXT, 'description'],
      [ContentType.WORDCLOUD, 'cloud'],
      [ContentType.SORT, 'move_up'],
      [ContentType.PRIORITIZATION, 'sort'],
      [ContentType.SLIDE, 'info'],
      [ContentType.FLASHCARD, 'school'],
    ]);
  }
}

export default {
  component: ContentGroupTemplatePreviewComponent,
  title: 'ContentGroupTemplatePreview',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [
        ContentGroupTemplatePreviewComponent,
        AddTemplateButtonComponent,
        BrowserAnimationsModule,
      ],
      providers: [
        {
          provide: BaseTemplateService,
          useClass: MockTemplateService,
        },
        {
          provide: NotificationService,
          useClass: MockService,
        },
        {
          provide: ContentService,
          useClass: MockContentService,
        },
        {
          provide: ApiConfigService,
          useClass: MockApiConfigService,
        },
        {
          provide: RoutingService,
          useClass: MockRoutingService,
        },
        {
          provide: RoomMembershipService,
          useClass: MockService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { data: {}, params: { templateId: 'templateId1' } },
          },
        },
        {
          provide: AuthenticationService,
          useClass: MockService,
        },
        {
          provide: DialogService,
          useClass: MockService,
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

type Story = StoryObj<ContentGroupTemplatePreviewComponent>;

export const ContentGroupTemplatePreview: Story = {};
