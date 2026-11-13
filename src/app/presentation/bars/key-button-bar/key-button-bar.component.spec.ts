import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KeyNavBarItem } from '@app/presentation/bars/control-bar/control-bar.component';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { KeyButtonBarComponent } from './key-button-bar.component';

describe('KeyButtonBarComponent', () => {
  let fixture: ComponentFixture<KeyButtonBarComponent>;

  function setUp(items: KeyNavBarItem[]) {
    configureTestModule([
      getTranslocoModule(),
      KeyButtonBarComponent,
    ]).compileComponents();
    fixture = TestBed.createComponent(KeyButtonBarComponent);
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();
  }

  function button(name: string): HTMLElement {
    return fixture.nativeElement.querySelector(`[data-testid="${name}-btn"]`);
  }

  it('tells assistive technology whether a toggle is on', () => {
    const results = new KeyNavBarItem(
      'results',
      'insert_chart',
      '',
      ' ',
      false,
      false,
      true
    );
    setUp([results]);
    expect(button('results').getAttribute('aria-pressed')).toBe('false');

    results.highlighted = true;
    fixture.detectChanges();

    expect(button('results').getAttribute('aria-pressed')).toBe('true');
  });

  it('does not present other buttons as toggles', () => {
    setUp([new KeyNavBarItem('exit', 'close', '', 'Escape', false, true)]);

    expect(button('exit').hasAttribute('aria-pressed')).toBeFalse();
  });
});
