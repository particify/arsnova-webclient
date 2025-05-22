import { Component, ViewChild } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import {
  HotkeyActionType,
  HotkeyModifier,
  HotkeyService,
} from '@app/core/services/util/hotkey.service';
import { HotkeyDirective } from './hotkey.directive';
import { configureTestModule } from '@testing/test.setup';

@Component({
  template: ` <button
    #button
    appHotkey="a"
    [appHotkeyControl]="true"
    appHotkeyTitle="title"
    (click)="click()"
  >
    Hotkey Button
  </button>`,
  imports: [HotkeyDirective],
})
class TestComponent {
  @ViewChild('button') button!: HTMLButtonElement;

  click() {}
}

describe('HotkeyDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let hotkeyService: HotkeyService;

  beforeEach(() => {
    const testBed = configureTestModule([HotkeyDirective, TestComponent]);
    fixture = testBed.createComponent(TestComponent);
    hotkeyService = testBed.inject(HotkeyService);
    fixture.detectChanges();
  });

  it('should register the correct hotkey', () => {
    expect(hotkeyService.registerHotkey).toHaveBeenCalledWith({
      key: 'a',
      modifiers: [HotkeyModifier.CONTROL],
      action: jasmine.any(Function),
      actionTitle: 'title',
      actionType: HotkeyActionType.DEFAULT,
    });
  });
});
