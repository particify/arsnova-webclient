import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
} from '@angular/core';
import {
  Hotkey,
  HotkeyActionType,
  HotkeyModifier,
  HotkeyService,
} from '../services/util/hotkey.service';

export enum HotkeyAction {
  FOCUS,
  CLICK,
}

const NON_TEXT_INPUT_TYPES = ['button', 'checkbox', 'radio'];

@Directive({
  selector: '[appHotkey]',
})
export class HotkeyDirective implements OnDestroy, OnChanges {
  @Input() appHotkey: string;
  @Input() appHotkeyDisabled = false;
  @Input() appHotkeyControl = false;
  @Input() appHotkeyAlt = false;
  @Input() appHotkeyShift = false;
  @Input() appHotkeyAction = HotkeyAction.FOCUS;
  @Input() appHotkeyTitle: string;
  @Input() matTooltip: string;

  private hotkeyRef: symbol;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private hotkeyService: HotkeyService
  ) {}

  ngOnDestroy(): void {
    this.hotkeyService.unregisterHotkey(this.hotkeyRef);
  }

  ngOnChanges() {
    if (this.hotkeyRef) {
      if (this.appHotkeyDisabled) {
        this.hotkeyService.unregisterHotkey(this.hotkeyRef);
      } else {
        this.hotkeyService.updateHotkey(this.hotkeyRef, this.buildHotkey());
      }
    } else if (!this.appHotkeyDisabled) {
      this.hotkeyRef = this.hotkeyService.registerHotkey(this.buildHotkey());
    }
  }

  private buildHotkey(): Hotkey {
    const title = this.appHotkeyTitle ?? this.matTooltip;
    const action =
      this.appHotkeyAction === HotkeyAction.CLICK
        ? () => this.elementRef.nativeElement.click()
        : () => this.elementRef.nativeElement.focus();
    return {
      key: this.appHotkey,
      modifiers: this.buildModifierList(),
      actionTitle: title,
      action: action,
      actionType: this.determineActionType(this.elementRef.nativeElement),
    };
  }

  private buildModifierList(): HotkeyModifier[] {
    const modifiers: HotkeyModifier[] = [];
    if (this.appHotkeyControl) {
      modifiers.push(HotkeyModifier.CONTROL);
    }
    if (this.appHotkeyAlt) {
      modifiers.push(HotkeyModifier.ALT);
    }
    if (this.appHotkeyShift) {
      modifiers.push(HotkeyModifier.SHIFT);
    }

    return modifiers;
  }

  private determineActionType(element: HTMLElement): HotkeyActionType {
    if (
      (element.nodeName === 'INPUT' &&
        !NON_TEXT_INPUT_TYPES.includes((element as HTMLInputElement).type)) ||
      element.nodeName === 'TEXTAREA'
    ) {
      return HotkeyActionType.INPUT;
    }
    return HotkeyActionType.DEFAULT;
  }
}
