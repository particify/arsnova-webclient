import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { ContentGroupTemplatePreviewComponent } from './content-group-template-preview.component';

import { BaseTemplateService } from '@app/core/services/http/base-template.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ContentGroupTemplate } from '@app/core/models/content-group-template';
import { ContentService } from '@app/core/services/http/content.service';

import { RoomMembershipService } from '@app/core/services/room-membership.service';
import { Content } from '@app/core/models/content';
import { ContentType } from '@app/core/models/content-type.enum';
import { AddTemplateButtonComponent } from '@app/standalone/add-template-button/add-template-button.component';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { GroupType } from '@app/core/models/content-group';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { AuthProvider } from '@app/core/models/auth-provider';

class MockService {}

class MockTemplateService {
  getContentGroupTemplate() {
    return of(
      new ContentGroupTemplate(
        'Template name',
        'This is a description.',
        'en',
        true,
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

class MockContentGroupService {
  private typeIcons: Map<GroupType, string> = new Map<GroupType, string>([
    [GroupType.MIXED, 'dashboard'],
    [GroupType.QUIZ, 'sports_esports'],
    [GroupType.SURVEY, 'tune'],
    [GroupType.FLASHCARDS, 'school'],
  ]);
  getTypeIcons() {
    return this.typeIcons;
  }
}

class MockAuthenticationService {
  getCurrentAuthentication() {
    return of(
      new ClientAuthentication(
        'userId',
        'loginId',
        AuthProvider.ARSNOVA,
        'token'
      )
    );
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
      ],
      providers: [
        {
          provide: BaseTemplateService,
          useClass: MockTemplateService,
        },
        {
          provide: ContentService,
          useClass: MockContentService,
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
          useClass: MockAuthenticationService,
        },
        {
          provide: ContentGroupService,
          useClass: MockContentGroupService,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentGroupTemplatePreviewComponent>;

export const ContentGroupTemplatePreview: Story = {};
