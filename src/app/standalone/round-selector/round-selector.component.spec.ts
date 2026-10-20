import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import { Round } from '@gql/generated/graphql';
import { RoundSelectorComponent } from './round-selector.component';

function round(id: string, roundNo: number, closed = true): Round {
  return {
    __typename: 'Round',
    id,
    contentId: 'content-1',
    roundNo,
    closed,
    started: true,
    answerable: !closed,
  };
}

describe('RoundSelectorComponent', () => {
  let fixture: ComponentFixture<RoundSelectorComponent>;
  let component: RoundSelectorComponent;

  beforeEach(() => {
    configureTestModule([
      BrowserAnimationsModule,
      getTranslocoModule(),
      RoundSelectorComponent,
    ]).compileComponents();

    fixture = TestBed.createComponent(RoundSelectorComponent);
    component = fixture.componentInstance;
  });

  function setUp(rounds: Round[], selectedRoundIds: string[]) {
    fixture.componentRef.setInput('rounds', rounds);
    fixture.componentRef.setInput('selectedRoundIds', selectedRoundIds);
    fixture.detectChanges();
  }

  it('hides itself when the content only has a single round', () => {
    setUp([round('r1', 1)], ['r1']);
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('shows itself once a second round exists', () => {
    setUp([round('r1', 1), round('r2', 2)], ['r2']);
    expect(fixture.nativeElement.querySelector('button')).not.toBeNull();
  });

  it('labels the selection by round number, sorted ascending regardless of selection order', () => {
    setUp([round('r1', 1), round('r2', 2), round('r3', 3)], ['r3', 'r1']);
    expect(component.roundsLabel()).toBe('1 & 3');
  });

  it('uses the plural translation key once two rounds are selected', () => {
    setUp([round('r1', 1), round('r2', 2)], ['r1']);
    expect(component.translationKey()).toBe('content.round-displayed');

    component.toggleRound('r2');

    expect(component.translationKey()).toBe('content.rounds-displayed');
  });

  it('adds a second round to the selection instead of replacing the first', () => {
    setUp([round('r1', 1), round('r2', 2)], ['r1']);

    component.toggleRound('r2');

    expect(component.selectedRoundIds()).toEqual(['r1', 'r2']);
  });

  it('replaces the first selected round when a third one is picked', () => {
    setUp([round('r1', 1), round('r2', 2), round('r3', 3)], ['r1', 'r2']);

    component.toggleRound('r3');

    expect(component.selectedRoundIds()).toEqual(['r1', 'r3']);
  });

  it('deselects an already-selected round, as long as one stays selected', () => {
    setUp([round('r1', 1), round('r2', 2)], ['r1', 'r2']);

    component.toggleRound('r1');

    expect(component.selectedRoundIds()).toEqual(['r2']);
  });

  it('never deselects the last remaining round', () => {
    setUp([round('r1', 1), round('r2', 2)], ['r1']);

    component.toggleRound('r1');

    expect(component.selectedRoundIds()).toEqual(['r1']);
  });

  it('replaces the selection instead of comparing when comparison is disallowed', () => {
    setUp([round('r1', 1), round('r2', 2)], ['r1']);
    fixture.componentRef.setInput('allowComparison', false);

    component.toggleRound('r2');

    expect(component.selectedRoundIds()).toEqual(['r2']);
  });
});
