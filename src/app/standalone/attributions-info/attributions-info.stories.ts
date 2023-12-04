import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';

import { AttributionsInfoComponent } from './attributions-info.component';
import { importProvidersFrom } from '@angular/core';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { HttpClientModule } from '@angular/common/http';
import { Content } from '@app/core/models/content';
import { ContentType } from '@app/core/models/content-type.enum';
import { ContentLicenseAttribution } from '@app/core/models/content-license-attribution';

export default {
  component: AttributionsInfoComponent,
  title: 'AttributionsInfo',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [AttributionsInfoComponent],
    }),
    applicationConfig({
      providers: [
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<AttributionsInfoComponent>;

const contents = [
  new Content('roomId', 'subject', 'content1', [], ContentType.TEXT),
  new Content('roomId', 'subject', 'content2', [], ContentType.TEXT),
  new Content('roomId', 'subject', 'content3', [], ContentType.TEXT),
  new Content('roomId', 'subject', 'content4', [], ContentType.TEXT),
];

const attribution1 = new ContentLicenseAttribution();
attribution1.contentId = 'contentId1';
attribution1.attribution = 'Attribution';
attribution1.license = 'CC0-1.0';

const attribution2 = new ContentLicenseAttribution();
attribution2.contentId = 'contentId2';
attribution2.attribution = 'Attribution';
attribution2.license = 'CC0-1.0';

const attributions = [attribution1, attribution2];

export const AttributionsInfo: Story = {
  args: {
    contents: contents,
    attributions: attributions,
  },
};
