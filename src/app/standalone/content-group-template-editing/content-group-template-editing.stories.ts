import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';

import { ContentGroupTemplateEditingComponent } from './content-group-template-editing.component';
import { importProvidersFrom } from '@angular/core';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { HttpClientModule } from '@angular/common/http';
import { BaseTemplateService } from '@app/core/services/http/base-template.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { LanguageService } from '@app/core/services/util/language.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

class MockService {}

class MockLangService {
  getIsoLanguages() {
    return of([
      { code: 'en', nativeName: 'English', localizedName: 'Englisch' },
      { code: 'de', nativeName: 'Deutsch', localizedName: 'German' },
      { code: 'es', nativeName: 'español', localizedName: 'Spanish' },
    ]);
  }
}

class MockTemplateService {
  getTemplateTags() {
    return of([
      { id: 'tagId1', name: 'tag 1', verified: true },
      { id: 'tagId2', name: 'tag 2', verified: true },
      { id: 'tagId3', name: 'tag 3', verified: true },
    ]);
  }
}

export default {
  component: ContentGroupTemplateEditingComponent,
  title: 'ContentGroupTemplateEditing',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentGroupTemplateEditingComponent, BrowserAnimationsModule],
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
          provide: LanguageService,
          useClass: MockLangService,
        },
        {
          provide: GlobalStorageService,
          useClass: MockService,
        },
        {
          provide: RoutingService,
          useClass: MockService,
        },
        {
          provide: AnnounceService,
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

type Story = StoryObj<ContentGroupTemplateEditingComponent>;

export const ContentGroupTemplateEditing: Story = {
  args: {
    name: 'Template name',
  },
};
