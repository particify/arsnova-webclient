import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';

import { ContentGroupInfoComponent } from '@app/standalone/content-group-info/content-group-info.component';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { ContentGroup, GroupType } from '@app/core/models/content-group';

export default {
  component: ContentGroupInfoComponent,
  title: 'ContentGroupInfo',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentGroupInfoComponent],
    }),
    applicationConfig({
      providers: [
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentGroupInfoComponent>;

const contentGroupLockedMixed = new ContentGroup(
  'roomdId',
  'My locked content group',
  ['content1', 'content2', 'content3']
);

export const ContentGroupLockedMixed: Story = {
  args: {
    contentGroup: contentGroupLockedMixed,
  },
};

const contentGroupPublishedMixed = new ContentGroup(
  'roomdId',
  'My published content group',
  ['content1', 'content2', 'content3']
);
contentGroupPublishedMixed.published = true;

export const ContentGroupPublishedMixed: Story = {
  args: {
    contentGroup: contentGroupPublishedMixed,
  },
};

const contentGroupPublishedQuiz = new ContentGroup(
  'roomdId',
  'My published quiz',
  ['content1', 'content2', 'content3', 'content4', 'content5']
);
contentGroupPublishedQuiz.published = true;
contentGroupPublishedQuiz.groupType = GroupType.QUIZ;

export const ContentGroupPublishedQuiz: Story = {
  args: {
    contentGroup: contentGroupPublishedQuiz,
  },
};
