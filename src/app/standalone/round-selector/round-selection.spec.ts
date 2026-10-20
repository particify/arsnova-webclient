import { toggleRoundSelection } from './round-selection';

describe('toggleRoundSelection', () => {
  it('replaces the selection instead of comparing when comparison is disallowed', () => {
    expect(toggleRoundSelection(['r1'], 'r2', false)).toEqual(['r2']);
  });

  it('adds a second round instead of replacing the first', () => {
    expect(toggleRoundSelection(['r1'], 'r2', true)).toEqual(['r1', 'r2']);
  });

  it('replaces the first selected round when a third one is picked', () => {
    expect(toggleRoundSelection(['r1', 'r2'], 'r3', true)).toEqual([
      'r1',
      'r3',
    ]);
  });

  it('deselects an already-selected round, as long as one stays selected', () => {
    expect(toggleRoundSelection(['r1', 'r2'], 'r1', true)).toEqual(['r2']);
  });

  it('never deselects the last remaining round', () => {
    expect(toggleRoundSelection(['r1'], 'r1', true)).toEqual(['r1']);
  });
});
