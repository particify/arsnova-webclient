import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { MatDialogRef, MatDialogState } from '@angular/material/dialog';
import { EventManager } from '@angular/platform-browser';
import { environment } from '@environments/environment';
import { HotkeysComponent } from '@app/core/components/_dialogs/hotkeys/hotkeys.component';
import { DialogService } from './dialog.service';
import { EventService } from '@app/core/services/util/event.service';
import { HotkeyActivated } from '@app/core/models/events/hotkey-activated';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';

export const HELP_KEY = 'h';

export interface Hotkey {
  key: string;
  modifiers?: HotkeyModifier[];
  actionTitle: string;
  action: () => void;
  actionType?: HotkeyActionType;
}

export enum HotkeyModifier {
  CONTROL = 'Control',
  ALT = 'Alt',
  SHIFT = 'Shift',
}

export enum HotkeyActionType {
  DEFAULT,
  INPUT,
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
  ['ArrowRight', '➡'],
]);

const includedInputTypes = ['button', 'checkbox', 'radio'];

const excludedElementTypes = new Map<string, (el: Element) => boolean>([
  [
    'INPUT',
    (el) => !includedInputTypes.includes((el as HTMLInputElement).type),
  ],
  ['TEXTAREA', () => true],
  ['SELECT', () => true],
]);

@Injectable({
  providedIn: 'root',
})
export class HotkeyService {
  private eventManager = inject(EventManager);
  private dialogService = inject(DialogService);
  private eventService = inject(EventService);
  private globalStorageService = inject(GlobalStorageService);
  private document = inject<HTMLDocument>(DOCUMENT);

  hotkeyRegistrations: Map<symbol, Hotkey> = new Map();

  private dialogRef?: MatDialogRef<HotkeysComponent>;
  private counter: number;

  constructor() {
    const globalStorageService = this.globalStorageService;

    this.registerHandler();
    this.registerDialogHotkey();
    this.counter = globalStorageService.getItem(STORAGE_KEYS.HOTKEY_COUNT) ?? 0;
  }

  static getKeyDisplayInfo(key: string): HotkeyDisplayInfo {
    const keyName = key === ' ' ? 'space' : key.toLowerCase();
    return {
      keyName: keyName,
      keySymbol: KEY_SYMBOLS.get(key) ?? key.toUpperCase(),
      translateKeyName: keyName.length > 1 && !KEY_SYMBOLS.has(key),
    };
  }

  registerHotkey(hotkey: Hotkey, localHotkeyRegistrations?: symbol[]): symbol {
    const registrationRef = Symbol(hotkey.key);
    const modifiers = hotkey.modifiers ?? [];
    const actionType = hotkey.actionType ?? HotkeyActionType.DEFAULT;
    this.hotkeyRegistrations.set(registrationRef, {
      ...hotkey,
      modifiers: modifiers,
      actionType: actionType,
    });
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
      actionTitle: 'hotkeys.display-overview',
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
      width: '500px',
    });
  }

  private getHotkeyInfos(): HotkeyInfo[] {
    const sortedHotkeys = this.sortHotkeys(
      Array.from(this.hotkeyRegistrations.values())
    );
    const hotkeyInfos: HotkeyInfo[] = [];
    sortedHotkeys.forEach((h) => {
      hotkeyInfos.push({
        ...HotkeyService.getKeyDisplayInfo(h.key),
        modifiers: h.modifiers,
        actionTitle: h.actionTitle,
        actionType: h.actionType || HotkeyActionType.DEFAULT,
      });
    });
    return hotkeyInfos;
  }

  private sortHotkeys(hotkeys: Hotkey[]) {
    return hotkeys.sort((a, b) =>
      a.key.length === b.key.length
        ? a.key.localeCompare(b.key)
        : b.key.length - a.key.length
    );
  }

  // eslint-disable-next-line complexity
  private handleKeyboardEvent(event: KeyboardEvent) {
    for (const hotkey of this.hotkeyRegistrations.values()) {
      if (event.key !== hotkey.key) {
        continue;
      }
      for (const modifier of [
        HotkeyModifier.CONTROL,
        HotkeyModifier.ALT,
        HotkeyModifier.SHIFT,
      ]) {
        if (
          event.getModifierState(modifier) !==
          hotkey.modifiers?.includes(modifier)
        ) {
          return;
        }
      }
      if (this.checkIfExcludedElement()) {
        if (!environment.production) {
          console.log('Registered hotkey detected but ignored.', hotkey, event);
        }
        return;
      }
      if (this.dialogRef && event.key !== HELP_KEY) {
        this.closeHelpDialog(event, hotkey);
      }
      if (!environment.production) {
        console.log('Registered hotkey detected.', hotkey, event);
      }
      event.preventDefault();
      hotkey.action();
      this.emitApplicationEvent();
    }
  }

  private checkIfExcludedElement() {
    const activeElement = this.document.activeElement;
    if (activeElement) {
      const excludedElementType = excludedElementTypes.get(
        activeElement.nodeName
      );
      if (excludedElementType) {
        return excludedElementType(activeElement);
      }
    }
  }

  private closeHelpDialog(event: KeyboardEvent, hotkey: Hotkey) {
    this.dialogRef?.close();
    // Explicitly reset dialogRef because we cannot rely on MatDialogState here.
    // The dialog is closed before this handler is called when pressing Escape.
    this.dialogRef = undefined;
    if (event.key === 'Escape') {
      if (!environment.production) {
        console.log('Registered hotkey detected but ignored.', hotkey, event);
      }
      return;
    }
  }

  private registerHandler() {
    this.eventManager.addEventListener(
      this.document.documentElement,
      'keydown',
      (e: KeyboardEvent) => {
        if (!e.repeat) {
          this.handleKeyboardEvent(e);
        }
      }
    );
  }

  private emitApplicationEvent() {
    this.counter++;
    this.globalStorageService.setItem(STORAGE_KEYS.HOTKEY_COUNT, this.counter);
    const event = new HotkeyActivated(this.counter);
    this.eventService.broadcast(event.type, event.payload);
  }
}
