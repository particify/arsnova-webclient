import { Directive, ElementRef, Input, OnChanges, OnDestroy } from '@angular/core';
import { Hotkey, HotkeyModifier, HotkeyService } from '../services/util/hotkey.service';

export enum HotkeyAction {
  FOCUS,
  CLICK
}
@Directive({
  selector: '[appHotkey]'
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

  private hotkeyRef: Symbol;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private hotkeyService: HotkeyService
  ) { }

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
    const action = this.appHotkeyAction === HotkeyAction.CLICK
        ? () => this.elementRef.nativeElement.click()
        : () => this.elementRef.nativeElement.focus();
    return {
      key: this.appHotkey,
      modifiers: this.buildModifierList(),
      actionTitle: title,
      action: action
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
}
