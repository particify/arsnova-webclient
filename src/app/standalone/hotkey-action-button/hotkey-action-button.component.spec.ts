import { TestBed } from '@angular/core/testing';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import { HotkeyActionButtonComponent } from './hotkey-action-button.component';

describe('HotkeyActionButtonComponent', () => {
  beforeEach(() => {
    configureTestModule([
      HotkeyActionButtonComponent,
      getTranslocoModule(),
    ]).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(HotkeyActionButtonComponent);
    fixture.componentInstance.hotkey = 's';
    fixture.componentInstance.hotkeyTitle = 'Stop content';
    fixture.componentInstance.action = 'to stop content';
    return fixture;
  }

  function buttonContainer(
    fixture: ReturnType<typeof createComponent>
  ): HTMLElement {
    return fixture.nativeElement.querySelector('.button-container');
  }

  it('does not add the bottom-space class by default', () => {
    const fixture = createComponent();
    fixture.detectChanges();

    expect(buttonContainer(fixture).classList).not.toContain('bottom-space');
  });

  it('adds the bottom-space class when additionalBottomSpace is set', () => {
    const fixture = createComponent();
    fixture.componentInstance.additionalBottomSpace = true;
    fixture.detectChanges();

    expect(buttonContainer(fixture).classList).toContain('bottom-space');
  });

  it('composes nav-bar-below with bottom-space rather than replacing it', () => {
    const fixture = createComponent();
    fixture.componentInstance.additionalBottomSpace = true;
    fixture.componentInstance.isNavBarVisible = true;
    fixture.detectChanges();

    const classList = buttonContainer(fixture).classList;
    expect(classList).toContain('bottom-space');
    expect(classList).toContain('nav-bar-below');
  });
});
