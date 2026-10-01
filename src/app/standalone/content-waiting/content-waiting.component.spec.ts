import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApolloCache } from '@apollo/client/core';
import {
  RoomUserAlias,
  RoomUserAliasByRoomIdDocument,
  RoomUserAliasByRoomIdGql,
  SetRoomUserAliasGql,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { of } from 'rxjs';
import { ContentWaitingComponent } from './content-waiting.component';

describe('ContentWaitingComponent', () => {
  let fixture: ComponentFixture<ContentWaitingComponent>;
  let component: ContentWaitingComponent;
  let setRoomUserAlias: jasmine.SpyObj<SetRoomUserAliasGql>;
  let roomUserAliasByRoomId: jasmine.SpyObj<RoomUserAliasByRoomIdGql>;

  const proposal: RoomUserAlias = {
    __typename: 'RoomUserAlias',
    id: null,
    alias: 'Brave Otter',
    seed: 42,
  };
  const persisted: RoomUserAlias = { ...proposal, id: 'alias-1' };

  beforeEach(() => {
    setRoomUserAlias = jasmine.createSpyObj('SetRoomUserAliasGql', ['mutate']);
    setRoomUserAlias.mutate.and.returnValue(
      of({ data: { setRoomUserAlias: persisted } }) as never
    );
    roomUserAliasByRoomId = jasmine.createSpyObj('RoomUserAliasByRoomIdGql', [
      'fetch',
    ]);
    TestBed.overrideComponent(ContentWaitingComponent, {
      set: { template: '' },
    });
    configureTestModule(
      [getTranslocoModule(), ContentWaitingComponent],
      [
        { provide: SetRoomUserAliasGql, useValue: setRoomUserAlias },
        { provide: RoomUserAliasByRoomIdGql, useValue: roomUserAliasByRoomId },
      ]
    ).compileComponents();
    fixture = TestBed.createComponent(ContentWaitingComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('roomId', 'room-1');
    fixture.componentRef.setInput('alias', { ...proposal });
    fixture.detectChanges();
  });

  function mutateOptions() {
    return setRoomUserAlias.mutate.calls.mostRecent().args[0]!;
  }

  it('accepts the proposal by its seed', () => {
    component.setAlias();
    expect(mutateOptions().variables).toEqual({ roomId: 'room-1', seed: 42 });
  });

  it('sets a custom alias instead of the proposal', () => {
    component.enteredAlias = 'Quiz Wizard';
    component.setAlias();
    expect(mutateOptions().variables).toEqual({
      roomId: 'room-1',
      alias: 'Quiz Wizard',
    });
  });

  it('announces the alias once it is set', () => {
    const aliasSet = spyOn(component.aliasSet, 'emit');
    component.setAlias();
    expect(aliasSet).toHaveBeenCalledTimes(1);
  });

  it('writes the persisted alias into the query the proposal came from', () => {
    component.setAlias();
    const cache = jasmine.createSpyObj<ApolloCache>('ApolloCache', [
      'writeQuery',
    ]);
    const update = mutateOptions().update as unknown as (
      cache: ApolloCache,
      result: { data: { setRoomUserAlias: RoomUserAlias } }
    ) => void;
    update(cache, { data: { setRoomUserAlias: persisted } });
    expect(cache.writeQuery).toHaveBeenCalledOnceWith({
      query: RoomUserAliasByRoomIdDocument,
      variables: { roomId: 'room-1' },
      data: { roomUserAliasByRoomId: persisted },
    });
  });

  it('fetches a fresh proposal from the network', () => {
    const next = { ...proposal, alias: 'Calm Heron', seed: 7 };
    roomUserAliasByRoomId.fetch.and.returnValue(
      of({ data: { roomUserAliasByRoomId: next } }) as never
    );
    component.generateAlias();
    expect(roomUserAliasByRoomId.fetch).toHaveBeenCalledOnceWith({
      variables: { roomId: 'room-1' },
      fetchPolicy: 'network-only',
    });
    expect(component.alias).toEqual(next);
  });

  it('keeps the current proposal when none comes back', () => {
    roomUserAliasByRoomId.fetch.and.returnValue(
      of({ data: { roomUserAliasByRoomId: null } }) as never
    );
    component.generateAlias();
    expect(component.alias).toEqual(proposal);
  });
});
