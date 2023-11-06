import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';
import { FooterComponent } from '@app/standalone/footer/footer.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ConsentService } from '@app/core/services/util/consent.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { TranslocoRootModule } from '@app/transloco-root.module';

class MockConsentService {}

export default {
  component: FooterComponent,
  title: 'Footer',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [FooterComponent, BrowserAnimationsModule, RouterTestingModule],
      providers: [
        {
          provide: ConsentService,
          useClass: MockConsentService,
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

type Story = StoryObj<FooterComponent>;

export const Footer: Story = {};
