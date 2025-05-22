import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { AttributionsInfoComponent } from './attributions-info.component';

import { Content } from '@app/core/models/content';
import { ContentType } from '@app/core/models/content-type.enum';
import { ContentLicenseAttribution } from '@app/core/models/content-license-attribution';
import { ContentGroup } from '@app/core/models/content-group';
import { of } from 'rxjs';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';

class MockContentService {
  private content1 = new Content(
    'roomId',
    'subject',
    'content1',
    [],
    ContentType.TEXT
  );
  private content2 = new Content(
    'roomId',
    'subject',
    'content2',
    [],
    ContentType.TEXT
  );
  private content3 = new Content(
    'roomId',
    'subject',
    'content3',
    [],
    ContentType.TEXT
  );

  getContentsByIds() {
    this.content1.id = 'content1';
    this.content2.id = 'content2';
    this.content3.id = 'content3';
    return of([this.content1, this.content2, this.content3]);
  }
}

class MockContentGroupService {
  private attribution1 = new ContentLicenseAttribution();
  private attribution2 = new ContentLicenseAttribution();

  getAttributions() {
    this.attribution1.contentId = 'content1';
    this.attribution1.attribution = 'Albert Einstein';
    this.attribution1.license = 'CC0-1.0';
    this.attribution2.contentId = 'content3';
    this.attribution2.attribution = 'Albert Einstein';
    this.attribution2.license = 'CC-BY-4.0';
    return of([this.attribution1, this.attribution2]);
  }
}

export default {
  component: AttributionsInfoComponent,
  title: 'AttributionsInfo',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [AttributionsInfoComponent],
      providers: [
        {
          provide: ContentService,
          useClass: MockContentService,
        },
        {
          provide: ContentGroupService,
          useClass: MockContentGroupService,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<AttributionsInfoComponent>;

const contentGroup = new ContentGroup();
contentGroup.roomId = '1234';
contentGroup.contentIds = ['content1', 'content2', 'content3', 'content4'];

export const AttributionsInfo: Story = {
  args: {
    contentGroup: contentGroup,
  },
};
