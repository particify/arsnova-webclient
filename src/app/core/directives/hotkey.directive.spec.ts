import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  HotkeyActionType,
  HotkeyModifier,
  HotkeyService,
} from '@app/core/services/util/hotkey.service';
import { HotkeyDirective } from './hotkey.directive';

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
})
class TestComponent {
  @ViewChild('button') button: HTMLButtonElement;

  click() {}
}

describe('HotkeyDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  const hotkeyService = jasmine.createSpyObj('HotkeyService', [
    'registerHotkey',
    'unregisterHotkey',
  ]);

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      declarations: [HotkeyDirective, TestComponent],
      providers: [
        {
          provide: HotkeyService,
          useValue: hotkeyService,
        },
      ],
    }).createComponent(TestComponent);
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
