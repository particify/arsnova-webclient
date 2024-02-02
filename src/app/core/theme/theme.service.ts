import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { MaterialCssVarsService } from 'angular-material-css-vars';

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export class Colors {
  primary: string;
  accent: string;

  constructor(primary: string, accent: string) {
    this.primary = primary;
    this.accent = accent;
  }
}

@Injectable()
export class ThemeService {
  private currentTheme: Theme;
  private currentTheme$ = new Subject<Theme>();
  private themes = [Theme.LIGHT, Theme.DARK];
  private barColors = [
    'blue',
    'yellow',
    'teal',
    'deep-orange',
    'purple',
    'brown',
    'green',
    'pink',
    'cyan',
    'orange',
    'light-green',
    'red',
  ];
  private likertColors = [
    'strongly-agree',
    'agree',
    'neither',
    'disagree',
    'strongly-disagree',
  ];
  private binaryColors = ['strongly-agree', 'strongly-disagree'];
  private lightWarnColor = '#c62828';
  private lightColors = new Colors('#5e35b1', '#2e7d32');
  private darkColors = new Colors('#b388ff', '#b9f6ca');

  constructor(
    private globalStorageService: GlobalStorageService,
    private materialCssVarsService: MaterialCssVarsService
  ) {
    this.currentTheme = this.globalStorageService.getItem(STORAGE_KEYS.THEME);
    if (!this.themes.includes(this.currentTheme)) {
      this.currentTheme = Theme.LIGHT;
    }
    this.activate(this.currentTheme);
  }

  setLightColors(colors: Colors) {
    this.lightColors = colors;
  }

  getCurrentTheme$(): Observable<Theme> {
    return this.currentTheme$;
  }

  getCurrentTheme(): string {
    return this.currentTheme;
  }

  toggleTheme() {
    const newTheme =
      this.currentTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
    this.activate(newTheme);
  }

  activate(theme = this.currentTheme) {
    this.materialCssVarsService.setDarkTheme(theme === Theme.DARK);
    if (theme === Theme.DARK) {
      this.materialCssVarsService.setPrimaryColor(this.darkColors.primary);
      this.materialCssVarsService.setAccentColor(this.darkColors.accent);
    } else {
      this.materialCssVarsService.setPrimaryColor(this.lightColors.primary);
      this.materialCssVarsService.setAccentColor(this.lightColors.accent);
      this.materialCssVarsService.setWarnColor(this.lightWarnColor);
    }
    this.globalStorageService.setItem(STORAGE_KEYS.THEME, theme);
    this.currentTheme$.next(theme);
    this.currentTheme = theme;
  }

  getThemes(): Theme[] {
    return this.themes;
  }

  getCssVariable(name: string) {
    const computedStyle = getComputedStyle(document.body);
    return computedStyle.getPropertyValue(name).trim();
  }

  getColor(name: string) {
    return this.getCssVariable(`--${name}`);
  }

  getColorArray(names: string[], prefix: string): string[] {
    return names.map((name) => this.getCssVariable(`--${prefix}-${name}`));
  }

  getBarColors(): string[] {
    return this.getColorArray(this.barColors, 'bar');
  }

  getLikertColors(): string[] {
    return this.getColorArray(this.likertColors, 'likert');
  }

  getBinaryColors(): string[] {
    return this.getColorArray(this.binaryColors, 'likert');
  }

  getPrimaryColor() {
    return this.currentTheme === Theme.LIGHT
      ? this.lightColors.primary
      : this.darkColors.primary;
  }
}
