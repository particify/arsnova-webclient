import type { StorybookConfig } from '@storybook/angular';
const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  staticDirs: [{ from: '../src/assets', to: '/assets' }],
  addons: ['@storybook/addon-essentials'],
  framework: '@storybook/angular',
};
export default config;
