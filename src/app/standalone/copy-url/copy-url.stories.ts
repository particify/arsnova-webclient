import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { TranslateModule } from '@ngx-translate/core';
import { CopyUrlComponent } from '@app/standalone/copy-url/copy-url.component';
import { NotificationService } from '@app/core/services/util/notification.service';

class MockNotificationService {}

export default {
  component: CopyUrlComponent,
  title: 'CopyUrl',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [TranslateModule.forRoot(), CopyUrlComponent],
      providers: [
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<CopyUrlComponent>;

export const CopyUrl: Story = {
  args: {
    url: 'https://path-to-whatever',
  },
};
