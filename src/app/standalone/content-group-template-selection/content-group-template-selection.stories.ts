import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';

import { ContentGroupTemplateSelectionComponent } from './content-group-template-selection.component';
import { importProvidersFrom } from '@angular/core';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { HttpClientModule } from '@angular/common/http';
import { BaseTemplateService } from '@app/core/services/http/base-template.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { ActivatedRoute } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ContentGroupTemplate } from '@app/core/models/content-group-template';
import { AddTemplateButtonComponent } from '@app/standalone/add-template-button/add-template-button.component';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { RoomMembershipService } from '@app/core/services/room-membership.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { LanguageService } from '@app/core/services/util/language.service';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { AuthProvider } from '@app/core/models/auth-provider';
import { RoutingService } from '@app/core/services/util/routing.service';
import { TemplateTagSelectionComponent } from '@app/standalone/template-tag-selection/template-tag-selection.component';
import { TemplateLanguageSelectionComponent } from '@app/standalone/template-language-selection/template-language-selection.component';
import { DialogService } from '@app/core/services/util/dialog.service';
import { GroupType } from '@app/core/models/content-group';
import { ContentGroupService } from '@app/core/services/http/content-group.service';

class MockService {}

class MockTemplateService {
  getTemplateTags() {
    return of([
      { id: 'tagId1', name: 'tag 1', verified: true },
      { id: 'tagId2', name: 'tag 2', verified: true },
      { id: 'tagId3', name: 'tag 3', verified: true },
      { id: 'tagId4', name: 'tag 4', verified: true },
      { id: 'tagId5', name: 'tag 5', verified: true },
    ]);
  }

  getContentGroupTemplates() {
    return of([
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
      ),
      new ContentGroupTemplate(
        'Another template name',
        'This is another description.',
        'en',
        true,
        [
          { id: 'tagId1', name: 'tag 3', verified: true },
          { id: 'tagId2', name: 'tag 4', verified: true },
          { id: 'tagId3', name: 'tag 5', verified: true },
        ],
        'CC0-1.0',
        false,
        undefined,
        ['templateId1', 'templateId2', 'templateId3', 'templateId4']
      ),
      new ContentGroupTemplate(
        'Template name',
        'This is a description.',
        'en',
        true,
        [
          { id: 'tagId1', name: 'tag 1', verified: true },
          { id: 'tagId2', name: 'tag 3', verified: true },
          { id: 'tagId3', name: 'tag 5', verified: true },
        ],
        'CC-BY-SA-4.0',
        true,
        'Attribution',
        ['templateId1', 'templateId2', 'templateId4']
      ),
    ]);
  }
}

class MockLangService {
  getIsoLanguages() {
    return of([
      { code: 'en', nativeName: 'English', localizedName: 'Englisch' },
      { code: 'de', nativeName: 'Deutsch', localizedName: 'German' },
      { code: 'es', nativeName: 'español', localizedName: 'Spanish' },
    ]);
  }
}

class MockAuthenticationService {
  getCurrentAuthentication() {
    return of(
      new ClientAuthentication(
        'userId',
        'loginid',
        AuthProvider.ARSNOVA,
        'token'
      )
    );
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

export default {
  component: ContentGroupTemplateSelectionComponent,
  title: 'ContentGroupTemplateSelection',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [
        ContentGroupTemplateSelectionComponent,
        AddTemplateButtonComponent,
        TemplateLanguageSelectionComponent,
        TemplateTagSelectionComponent,
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
          provide: AuthenticationService,
          useClass: MockAuthenticationService,
        },
        {
          provide: RoomMembershipService,
          useClass: MockService,
        },
        {
          provide: AnnounceService,
          useClass: MockService,
        },
        {
          provide: LanguageService,
          useClass: MockLangService,
        },
        {
          provide: RoutingService,
          useClass: MockService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { data: {}, queryParams: { lang: 'en' } },
          },
        },
        {
          provide: DialogService,
          useClass: MockService,
        },
        {
          provide: ContentGroupService,
          useClass: MockContentGroupService,
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

type Story = StoryObj<ContentGroupTemplateSelectionComponent>;

export const ContentGroupTemplateSelection: Story = {};
