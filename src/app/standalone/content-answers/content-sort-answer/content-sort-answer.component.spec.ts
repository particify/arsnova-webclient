import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import { FormattingService } from '@app/core/services/http/formatting.service';
import {
  ContentSortAnswerComponent,
  SortItem,
} from './content-sort-answer.component';

describe('ContentSortAnswerComponent', () => {
  let fixture: ComponentFixture<ContentSortAnswerComponent>;
  let component: ContentSortAnswerComponent;
  let reordered: string[][];

  function setUp(labels = ['A', 'B', 'C']) {
    configureTestModule(
      [getTranslocoModule(), ContentSortAnswerComponent],
      [
        {
          provide: FormattingService,
          useValue: { postString: () => of({ html: '' }) },
        },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(ContentSortAnswerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput(
      'answerOptions',
      labels.map((label) => ({ label }))
    );
    reordered = [];
    component.reordered.subscribe((items) =>
      reordered.push(items.map((item) => item.label))
    );
    fixture.detectChanges();
  }

  function items(): HTMLElement[] {
    return fixture.debugElement
      .queryAll(By.css('.answer'))
      .map((element) => element.nativeElement);
  }

  function labels(): string[] {
    return component.dragDroplist.map((item) => item.label);
  }

  /** Feeds back what the participant component does with the emitted order. */
  function applyReorder() {
    const latest = reordered[reordered.length - 1];
    fixture.componentRef.setInput(
      'answerOptions',
      latest.map((label) => ({ label }) as SortItem)
    );
    fixture.detectChanges();
  }

  function pressArrow(index: number, key: 'ArrowUp' | 'ArrowDown') {
    items()[index].dispatchEvent(new KeyboardEvent('keyup', { key }));
    fixture.detectChanges();
  }

  it('renders one focusable item per option, in the given order', () => {
    setUp();
    expect(items().length).toBe(3);
    expect(items().map((item) => item.getAttribute('tabindex'))).toEqual([
      '0',
      '0',
      '0',
    ]);
    expect(
      items().map((item) => item.getAttribute('aria-label'))
    ).not.toContain(null);
  });

  it('reorders on a drop and reports the new order', () => {
    setUp();
    component.drop(2, 0);
    expect(labels()).toEqual(['C', 'A', 'B']);
    expect(reordered).toEqual([['C', 'A', 'B']]);
  });

  it('moves an item down on the arrow down key', () => {
    setUp();
    pressArrow(0, 'ArrowDown');
    expect(reordered).toEqual([['B', 'A', 'C']]);
  });

  it('moves an item up on the arrow up key', () => {
    setUp();
    pressArrow(2, 'ArrowUp');
    expect(reordered).toEqual([['A', 'C', 'B']]);
  });

  it('keeps the first item at the top and the last at the bottom', () => {
    setUp();
    pressArrow(0, 'ArrowUp');
    pressArrow(2, 'ArrowDown');
    expect(reordered).toEqual([]);
    expect(labels()).toEqual(['A', 'B', 'C']);
  });

  it('walks an item down the list one key press at a time', () => {
    setUp();
    pressArrow(0, 'ArrowDown');
    applyReorder();
    pressArrow(1, 'ArrowDown');
    applyReorder();
    expect(labels()).toEqual(['B', 'C', 'A']);
  });

  it('keeps the moved item focused so the next key press continues', () => {
    setUp();
    items()[0].focus();
    pressArrow(0, 'ArrowDown');
    expect(component.selectedSortItem).toBe(1);
  });

  it('ignores the arrow keys and drops while disabled', () => {
    setUp();
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    pressArrow(0, 'ArrowDown');
    component.drop(0, 2);

    expect(labels()).toEqual(['A', 'B', 'C']);
    expect(reordered).toEqual([]);
  });

  it('takes the items out of the tab order while disabled', () => {
    setUp();
    expect(items()[0].tabIndex).toBe(0);

    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    expect(items()[0].tabIndex).toBe(-1);
    expect(items()[0].getAttribute('aria-disabled')).toBe('true');
  });

  it('leaves the given options untouched when reordering', () => {
    setUp();
    const given = component.answerOptions();

    pressArrow(0, 'ArrowDown');

    expect(given.map((item) => item.label)).toEqual(['A', 'B', 'C']);
    expect(labels()).toEqual(['B', 'A', 'C']);
  });

  it('stays neutral while no correctness is given', () => {
    setUp();
    expect(
      fixture.debugElement.query(By.css('[data-testid="sort-answer-correct"]'))
    ).toBeNull();
    expect(
      fixture.debugElement.query(By.css('[data-testid="sort-answer-wrong"]'))
    ).toBeNull();
    expect(fixture.debugElement.query(By.css('.solution.visible'))).toBeNull();
  });

  it('marks a correct order', () => {
    setUp();
    fixture.componentRef.setInput('correct', true);
    fixture.detectChanges();
    expect(
      fixture.debugElement.query(By.css('[data-testid="sort-answer-correct"]'))
    ).not.toBeNull();
    expect(
      fixture.debugElement.query(By.css('.solution.visible'))
    ).not.toBeNull();
  });

  it('marks a wrong order', () => {
    setUp();
    fixture.componentRef.setInput('correct', false);
    fixture.detectChanges();
    expect(
      fixture.debugElement.query(By.css('[data-testid="sort-answer-wrong"]'))
    ).not.toBeNull();
    expect(
      fixture.debugElement.query(By.css('.solution.visible'))
    ).not.toBeNull();
  });
});
