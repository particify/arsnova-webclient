import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { EventManager } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

export interface Hotkey {
  key: string;
  modifiers?: HotkeyModifier[];
  actionTitle: string;
  action: Function;
}

export enum HotkeyModifier {
  CONTROL = 'Control',
  ALT = 'Alt',
  SHIFT = 'Shift'
}

const includedInputTypes = ['button', 'checkbox', 'radio'];

const excludedElementTypes = new Map<string, (el: Element) => boolean>([
  ['INPUT', (el: HTMLInputElement) => !includedInputTypes.includes(el.type)],
  ['TEXTAREA', () => true],
  ['SELECT', () => true]
]);

@Injectable()
export class HotkeyService {
  hotkeyRegistrations: Map<Symbol, Hotkey> = new Map();
  unregisterHandler: Function;

  constructor(
    private eventManager: EventManager,
    @Inject(DOCUMENT) private document: HTMLDocument
  ) {
    this.registerHandler();
  }

  registerHotkey(hotkey: Hotkey, localHotkeyRegistrations?: Symbol[]): Symbol {
    const registrationRef = Symbol(hotkey.key);
    const modifiers = hotkey.modifiers ?? [];
    this.hotkeyRegistrations.set(registrationRef, { ...hotkey, modifiers: modifiers });
    if (localHotkeyRegistrations) {
      localHotkeyRegistrations.push(registrationRef);
    }
    return registrationRef;
  }

  unregisterHotkey(registrationRef: Symbol) {
    this.hotkeyRegistrations.delete(registrationRef);
  }

  updateHotkey(registrationRef: Symbol, hotkey: Hotkey) {
    this.hotkeyRegistrations.set(registrationRef, hotkey);
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
      if (!environment.production) {
        console.log('Registered hotkey detected.', hotkey, event);
      }
      hotkey.action();
    }
  }

  private registerHandler() {
    this.eventManager.addEventListener(
        this.document.documentElement, 'keyup', (e: KeyboardEvent) => this.handleKeyboardEvent(e));
  }
}
