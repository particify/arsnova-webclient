import { dirname, join } from 'path';
import type { StorybookConfig } from '@storybook/angular';
import { UserConfig, mergeConfig } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  staticDirs: [{ from: '../src/assets', to: '/assets' }],
  addons: [getAbsolutePath('@storybook/addon-docs')],
  framework: getAbsolutePath('@analogjs/storybook-angular'),
  async viteFinal(config: UserConfig) {
    return mergeConfig(config, {
      plugins: [viteTsConfigPaths()],
    });
  },
};
export default config;

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')));
}
