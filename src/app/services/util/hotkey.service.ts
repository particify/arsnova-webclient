import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { MatDialogRef, MatDialogState } from '@angular/material/dialog';
import { EventManager } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { HotkeysComponent } from '../../components/shared/_dialogs/hotkeys/hotkeys.component';
import { DialogService } from './dialog.service';

export const HELP_KEY = 'h';

export interface Hotkey {
  key: string;
  modifiers?: HotkeyModifier[];
  actionTitle: string;
  action: Function;
  actionType?: HotkeyActionType;
}

export enum HotkeyModifier {
  CONTROL = 'Control',
  ALT = 'Alt',
  SHIFT = 'Shift'
}

export enum HotkeyActionType {
  DEFAULT,
  INPUT
}

export interface HotkeyDisplayInfo {
  keyName: string;
  keySymbol: string;
  translateKeyName: boolean;
}

export interface HotkeyInfo extends HotkeyDisplayInfo {
  modifiers?: HotkeyModifier[];
  actionTitle: string;
  actionType: HotkeyActionType;
}

export const KEY_SYMBOLS = new Map<string, string>([
  ['ArrowLeft', '⬅'],
  ['ArrowRight', '➡']
]);

const includedInputTypes = ['button', 'checkbox', 'radio'];

const excludedElementTypes = new Map<string, (el: Element) => boolean>([
  ['INPUT', (el: HTMLInputElement) => !includedInputTypes.includes(el.type)],
  ['TEXTAREA', () => true],
  ['SELECT', () => true]
]);

@Injectable()
export class HotkeyService {
  hotkeyRegistrations: Map<symbol, Hotkey> = new Map();
  unregisterHandler: Function;

  private dialogRef: MatDialogRef<HotkeysComponent>;

  constructor(
    private eventManager: EventManager,
    private dialogService: DialogService,
    @Inject(DOCUMENT) private document: HTMLDocument
  ) {
    this.registerHandler();
    this.registerDialogHotkey();
  }

  static getKeyDisplayInfo(key: string): HotkeyDisplayInfo {
    const keyName = key === ' ' ? 'space' : key.toLowerCase();
    return {
      keyName: keyName,
      keySymbol: KEY_SYMBOLS.get(key) ?? key.toUpperCase(),
      translateKeyName: keyName.length > 1 && !KEY_SYMBOLS.has(key)
    }
  }

  registerHotkey(hotkey: Hotkey, localHotkeyRegistrations?: symbol[]): symbol {
    const registrationRef = Symbol(hotkey.key);
    const modifiers = hotkey.modifiers ?? [];
    const actionType = hotkey.actionType ?? HotkeyActionType.DEFAULT;
    this.hotkeyRegistrations.set(registrationRef, { ...hotkey, modifiers: modifiers, actionType: actionType });
    if (localHotkeyRegistrations) {
      localHotkeyRegistrations.push(registrationRef);
    }
    return registrationRef;
  }

  unregisterHotkey(registrationRef: symbol) {
    this.hotkeyRegistrations.delete(registrationRef);
  }

  updateHotkey(registrationRef: symbol, hotkey: Hotkey) {
    this.hotkeyRegistrations.set(registrationRef, hotkey);
  }

  private registerDialogHotkey() {
    this.registerHotkey({
      key: HELP_KEY,
      action: () => this.showDialog(),
      actionTitle: 'hotkeys.display-overview'
    });
  }

  private showDialog() {
    if (this.dialogRef?.getState() === MatDialogState.OPEN) {
      return;
    }
    // Remove focus to avoid screenreaders to announce the active element immediately after closing the dialog.
    (this.document.activeElement as HTMLElement).blur();
    this.dialogRef = this.dialogService.openDialog(HotkeysComponent, {
      data: this.getHotkeyInfos(),
      width: '500px'
    });
  }

  private getHotkeyInfos(): HotkeyInfo[] {
    return this.sortHotkeys(Array.from(this.hotkeyRegistrations.values()))
        .map(h => ({
          ...HotkeyService.getKeyDisplayInfo(h.key),
          modifiers: h.modifiers,
          actionTitle: h.actionTitle,
          actionType: h.actionType
        }));
  }

  private sortHotkeys(hotkeys: Hotkey[]) {
    return hotkeys.sort((a, b) => a.key.length === b.key.length ? a.key.localeCompare(b.key) : b.key.length - a.key.length);
  }

  private handleKeyboardEvent(event: KeyboardEvent) {
    for (const hotkey of this.hotkeyRegistrations.values()) {
      if (event.key !== hotkey.key) {
        continue;
      }
      for (const modifier of [HotkeyModifier.CONTROL, HotkeyModifier.ALT, HotkeyModifier.SHIFT]) {
        if (event.getModifierState(modifier) !== hotkey.modifiers.includes(modifier)) {
          return;
        }
      }
      const activeElement = this.document.activeElement;
      if (excludedElementTypes.has(activeElement.nodeName)
          && excludedElementTypes.get(activeElement.nodeName)(activeElement)) {
        if (!environment.production) {
          console.log('Registered hotkey detected but ignored.', hotkey, event);
        }
        return;
      }
      if (this.dialogRef && event.key !== HELP_KEY) {
        this.dialogRef.close();
        // Explicitly reset dialogRef because we cannot rely on MatDialogState here.
        // The dialog is closed before this handler is called when pressing Escape.
        this.dialogRef = null;
        if (event.key === 'Escape') {
          if (!environment.production) {
            console.log('Registered hotkey detected but ignored.', hotkey, event);
          }
          return;
        }
      }
      if (!environment.production) {
        console.log('Registered hotkey detected.', hotkey, event);
      }
      event.preventDefault();
      hotkey.action();
    }
  }

  private registerHandler() {
    this.eventManager.addEventListener(
        this.document.documentElement, 'keydown', (e: KeyboardEvent) => {
          if (!e.repeat) {
            this.handleKeyboardEvent(e)
          }
        });
  }
}
