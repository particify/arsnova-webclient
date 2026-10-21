import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { configureTestModule } from '@testing/test.setup';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { ThemeService } from '@app/core/theme/theme.service';
import { BarListComponent, BarListItem } from './bar-list.component';

// Real colours, since the browser drops a background-color it cannot parse.
const PALETTE = ['rgb(10, 20, 30)', 'rgb(40, 50, 60)', 'rgb(70, 80, 90)'];

/** Long enough to wrap in any width a row is ever given. */
const LONG_LABEL = 'a label long enough to wrap '.repeat(10).trim();

describe('BarListComponent', () => {
  let fixture: ComponentFixture<BarListComponent>;

  function setUp(items: BarListItem[], width?: string) {
    configureTestModule(
      [BarListComponent],
      [
        { provide: ThemeService, useValue: { getBarColors: () => PALETTE } },
        // The labels are markdown, rendered through this service.
        {
          provide: FormattingService,
          useValue: { postString: () => of({ html: '' }) },
        },
      ]
    ).compileComponents();

    // A real <app-bar-list> host, as the global label rule is scoped to it.
    fixture = TestBed.createComponent(BarListComponent, { inferTagName: true });
    fixture.componentRef.setInput('items', items);
    if (width) {
      // The host is an inline element until told otherwise, so a width alone
      // would not constrain the labels.
      (fixture.nativeElement as HTMLElement).style.cssText =
        `display: block; width: ${width}`;
    }
    fixture.detectChanges();
  }

  function items(values: number[]): BarListItem[] {
    return values.map((value, index) => ({
      label: `item ${index + 1}`,
      value,
    }));
  }

  function rows(): HTMLElement[] {
    return fixture.debugElement
      .queryAll(By.css('[role="listitem"]'))
      .map((element) => element.nativeElement);
  }

  function widths(): number[] {
    return fixture.debugElement
      .queryAll(By.css('[data-testid="bar"]'))
      .map((element) =>
        Number.parseFloat(
          (element.nativeElement as HTMLElement).style.width || '0'
        )
      );
  }

  function values(): string[] {
    return fixture.debugElement
      .queryAll(By.css('[data-testid="bar-value"]'))
      .map((element) => element.nativeElement.textContent as string);
  }

  function percentMode() {
    fixture.componentRef.setInput('dataLabelMode', 'percent');
    fixture.detectChanges();
  }

  function colors(): string[] {
    return fixture.debugElement
      .queryAll(By.css('[data-testid="bar"]'))
      .map(
        (element) =>
          (element.nativeElement as HTMLElement).style.backgroundColor
      );
  }

  function label(row: HTMLElement): HTMLElement {
    return row.querySelector('.bar-label') as HTMLElement;
  }

  function labelToBarGap(row: HTMLElement): number {
    const bar = row.querySelector('[data-testid="bar"]') as HTMLElement;
    return (
      bar.getBoundingClientRect().top -
      label(row).getBoundingClientRect().bottom
    );
  }

  /** As the formatting backend renders it: a paragraph, with margins of its own. */
  function renderedItem(text: string): BarListItem {
    return { label: text, labelRendered: `<p>${text}</p>`, value: 1 };
  }

  it('renders one row per item', () => {
    setUp(items([40, 30, 20, 10]));
    expect(rows().length).toBe(4);
    expect(values()).toEqual(['40', '30', '20', '10']);
  });

  it('reads label, then bar, then value', () => {
    setUp(items([40, 30]));
    const [labelElement, line] = Array.from(rows()[0].children);
    expect(labelElement.className).toBe('bar-label');
    expect(labelElement.querySelector('app-rendered-text')).toBeTruthy();
    expect(
      Array.from(line.children).map((child) =>
        child.getAttribute('data-testid')
      )
    ).toEqual(['bar', 'bar-value']);
  });

  it('sets a value just past the end of its own bar', () => {
    setUp(items([40, 10]));
    rows().forEach((row) => {
      const bar = (
        row.querySelector('[data-testid="bar"]') as HTMLElement
      ).getBoundingClientRect();
      const value = (
        row.querySelector('[data-testid="bar-value"]') as HTMLElement
      ).getBoundingClientRect();
      expect(value.left).toBeGreaterThanOrEqual(bar.right);
      // Beside the bar rather than above or below it.
      expect(value.top + value.height / 2).toBeCloseTo(
        bar.top + bar.height / 2,
        1
      );
    });
  });

  it('leaves the longest bar room for its value inside the row', () => {
    setUp(items([40, 30]));
    const row = rows()[0];
    const value = (
      row.querySelector('[data-testid="bar-value"]') as HTMLElement
    ).getBoundingClientRect();
    expect(widths()[0]).toBeLessThan(100);
    expect(value.right).toBeLessThanOrEqual(row.getBoundingClientRect().right);
  });

  it('sets a bar on nothing, with square corners', () => {
    setUp(items([40, 30]));
    const bar = fixture.debugElement.query(By.css('[data-testid="bar"]'))
      .nativeElement as HTMLElement;
    const style = getComputedStyle(bar);
    expect(style.borderRadius).toBe('0px');
    expect(
      getComputedStyle(bar.parentElement as HTMLElement).backgroundColor
    ).toBe('rgba(0, 0, 0, 0)');
  });

  it('shows a share of the values shown in percent mode', () => {
    setUp(items([30, 15, 5]));
    percentMode();
    expect(values()).toEqual(['60\u202F%', '30\u202F%', '10\u202F%']);
  });

  it('rounds a percentage to whole points, as the chart does', () => {
    setUp(items([1, 2]));
    percentMode();
    expect(values()).toEqual(['33\u202F%', '67\u202F%']);
  });

  it('shows no percentage of nothing rather than NaN', () => {
    setUp(items([0, 0]));
    percentMode();
    expect(values()).toEqual(['0\u202F%', '0\u202F%']);
  });

  it('sizes every bar relative to the largest value', () => {
    setUp(items([40, 30, 10]));
    const [largest, middle, smallest] = widths();
    // Reserving room for the values scales them all by the one factor.
    expect(middle / largest).toBeCloseTo(30 / 40, 5);
    expect(smallest / largest).toBeCloseTo(10 / 40, 5);
  });

  it('keeps a tiny value visible next to a large one', () => {
    setUp(items([1000, 1]));
    const [large, tiny] = widths();
    expect(tiny).toBeGreaterThan(0);
    expect(large).toBeGreaterThan(tiny);
  });

  it('draws no bar for an item nobody gave a point to', () => {
    setUp(items([50, 0]));
    const [given, none] = widths();
    expect(given).toBeGreaterThan(0);
    expect(none).toBe(0);
    expect(values()).toEqual(['50', '0']);
  });

  it('keeps every row while no points have been given at all', () => {
    setUp(items([0, 0, 0]));
    expect(rows().length).toBe(3);
    expect(widths()).toEqual([0, 0, 0]);
  });

  it('renders an empty list without a row', () => {
    setUp([]);
    expect(rows().length).toBe(0);
  });

  it('puts each label with its own value', () => {
    setUp([
      { label: 'first', value: 7 },
      { label: 'second', value: 3 },
    ]);
    expect(
      rows().map((row) => ({
        label: row.querySelector('app-rendered-text')?.textContent?.trim(),
        value: row
          .querySelector('[data-testid="bar-value"]')
          ?.textContent?.trim(),
      }))
    ).toEqual([
      { label: 'first', value: '7' },
      { label: 'second', value: '3' },
    ]);
  });

  it('renders a label the server already rendered as markup', () => {
    setUp([{ label: '*em*', labelRendered: '<em>em</em>', value: 1 }]);
    expect(rows()[0].querySelector('app-rendered-text em')?.textContent).toBe(
      'em'
    );
  });

  it('colours the bars from the theme palette, cycling once exhausted', () => {
    setUp(items([4, 3, 2, 1]));
    expect(colors()).toEqual([PALETTE[0], PALETTE[1], PALETTE[2], PALETTE[0]]);
  });

  it('clamps a long label rather than growing the row', () => {
    setUp([{ label: LONG_LABEL, value: 1 }], '160px');
    const labelElement = label(rows()[0]);
    const style = getComputedStyle(labelElement);
    expect(style.getPropertyValue('-webkit-line-clamp')).toBe('2');
    expect(style.overflow).toBe('hidden');
    expect(labelElement.scrollHeight).toBeGreaterThan(
      labelElement.clientHeight
    );
  });

  it('sets the values and the labels at one type size', () => {
    setUp(items([1]));
    const row = rows()[0];
    const value = row.querySelector('[data-testid="bar-value"]') as HTMLElement;
    expect(getComputedStyle(value).fontSize).toBe('14px');
    expect(getComputedStyle(label(row)).fontSize).toBe('14px');
  });

  it('keeps a label the same way clear of its bar, wrapped or not', () => {
    setUp([renderedItem('short'), renderedItem(LONG_LABEL)], '160px');
    const [oneLine, wrapped] = rows();
    const lineHeight = Number.parseFloat(
      getComputedStyle(label(oneLine)).lineHeight
    );
    // Neither case is exercised unless one label really wrapped and one did not.
    expect(label(oneLine).getBoundingClientRect().height).toBeLessThan(
      lineHeight * 1.5
    );
    expect(label(wrapped).getBoundingClientRect().height).toBeGreaterThan(
      lineHeight * 1.5
    );
    expect(labelToBarGap(oneLine)).toBeGreaterThan(0);
    expect(labelToBarGap(wrapped)).toBeCloseTo(labelToBarGap(oneLine), 1);
  });

  it('drops the margins of a label paragraph', () => {
    setUp([renderedItem('inside')]);
    const paragraph = rows()[0].querySelector('.rendered-text > p');
    expect(getComputedStyle(paragraph as HTMLElement).marginBottom).toBe('0px');
  });

  it('leaves the margins of a paragraph outside a bar list alone', () => {
    const outside = document.createElement('div');
    outside.innerHTML =
      '<div class="bar-list"><div class="bar-label"><div class="rendered-text">' +
      '<p>outside</p></div></div></div>';
    document.body.appendChild(outside);
    try {
      const paragraph = outside.querySelector('p') as HTMLElement;
      expect(getComputedStyle(paragraph).marginBottom).not.toBe('0px');
    } finally {
      outside.remove();
    }
  });
});
