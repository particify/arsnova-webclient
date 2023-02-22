import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '../app/services/util/global-storage.service';

export enum Theme {
  ARSNOVA = 'arsnova',
  DARK = 'dark',
}

@Injectable()
export class ThemeService {
  private bodyClassList: DOMTokenList;
  private currentTheme: string;
  private currentTheme$ = new BehaviorSubject(null);
  private themes = [Theme.ARSNOVA, Theme.DARK];
  private barColors = [
    'blue',
    'yellow',
    'teal',
    'red',
    'purple',
    'brown',
    'green',
    'pink',
  ];
  private likertColors = [
    'strongly-agree',
    'agree',
    'neither',
    'disagree',
    'strongly-disagree',
  ];
  private binaryColors = ['strongly-agree', 'strongly-disagree'];

  constructor(
    private globalStorageService: GlobalStorageService,
    @Inject(DOCUMENT) document: Document
  ) {
    this.bodyClassList = document.body.classList;
    this.currentTheme =
      this.globalStorageService.getItem(STORAGE_KEYS.THEME) || Theme.ARSNOVA;
    this.activate(this.currentTheme);
  }

  getCurrentTheme$(): Observable<Theme> {
    return this.currentTheme$;
  }

  getCurrentTheme(): string {
    return this.currentTheme;
  }

  activate(theme: string) {
    this.bodyClassList.remove(`theme-${this.currentTheme}`);
    this.bodyClassList.add(`theme-${theme}`);
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
}
