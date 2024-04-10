import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';
import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { HotkeyActionButtonComponent } from '@app/standalone/hotkey-action-button/hotkey-action-button.component';
import { HotkeyService } from '@app/core/services/util/hotkey.service';

class MockHotkeyService {
  registerHotkey() {}
  unregisterHotkey() {}
}

export default {
  component: HotkeyActionButtonComponent,
  title: 'HotkeyActionButton',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [HotkeyActionButtonComponent],
      providers: [
        {
          provide: HotkeyService,
          useClass: MockHotkeyService,
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

type Story = StoryObj<HotkeyActionButtonComponent>;

export const Hotkey1: Story = {
  args: {
    hotkey: 'p',
    hotkeyTitle: 'Publish content',
    action: 'to publish content',
    infoLabel: 'Content is locked',
    infoIcon: 'locked',
    isNavBarVisible: true,
  },
};

export const Hotkey2: Story = {
  args: {
    hotkey: 't',
    hotkeyTitle: 'Test this button',
    action: 'to test this button',
    isNavBarVisible: true,
  },
};
