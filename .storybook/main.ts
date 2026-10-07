import type { StorybookConfig } from '@storybook/angular';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { UserConfig, mergeConfig } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

const require = createRequire(import.meta.url);

// Storybook's own resolver walks node_modules, so it cannot find Plug'n'Play packages by name
function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, 'package.json')));
}

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  staticDirs: [{ from: '../src/assets', to: '/assets' }],
  addons: [getAbsolutePath('@storybook/addon-docs')],
  framework: getAbsolutePath(
    '@analogjs/storybook-angular'
  ) as StorybookConfig['framework'],
  async viteFinal(config: UserConfig) {
    return mergeConfig(config, {
      plugins: [viteTsConfigPaths()],
    });
  },
};
export default config;
