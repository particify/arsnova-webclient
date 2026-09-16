import { DebugElement } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  discardPeriodicTasks,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UiConfig } from '@app/core/models/api-config';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { SystemInfoService } from '@app/core/services/http/system-info.service';
import { ActiveRoomStatsGql } from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { Observable, of, throwError } from 'rxjs';

import { LiveIndicatorsComponent } from './live-indicators.component';

const REFRESH_INTERVAL = 30000;

/*
 * The component polls on an interval, so a pending periodic task keeps the fixture from ever
 * becoming stable - which rules out the Material harnesses, since every harness call awaits
 * stabilization. Hence fakeAsync plus data-testid queries here.
 */
describe('LiveIndicatorsComponent', () => {
  let fixture: ComponentFixture<LiveIndicatorsComponent>;
  let systemInfoService: jasmine.SpyObj<
    Pick<SystemInfoService, 'getConnectedUserCount'>
  >;
  let activeRoomStatsGql: jasmine.SpyObj<{
    fetch: (options: { variables?: object }) => Observable<unknown>;
  }>;
  let uiConfig: UiConfig;

  function fetchVariables(): object | undefined {
    return activeRoomStatsGql.fetch.calls.mostRecent().args[0].variables;
  }

  function activeRoomStatsResult(count: number): Observable<unknown> {
    return of({
      data: {
        adminActiveRoomStats: {
          count: count,
          minMemberCount: 10,
          activityWindowMinutes: 5,
        },
      },
    });
  }

  function createComponent(): void {
    fixture = TestBed.createComponent(LiveIndicatorsComponent);
    tick(0);
    fixture.detectChanges();
  }

  function indicator(testId: string): DebugElement | null {
    return fixture.debugElement.query(By.css(`[data-testid="${testId}"]`));
  }

  function countText(testId: string): string | undefined {
    return indicator(testId)
      ?.query(By.css('span'))
      ?.nativeElement.textContent.trim();
  }

  beforeEach(() => {
    uiConfig = {};
    systemInfoService = jasmine.createSpyObj('SystemInfoService', [
      'getConnectedUserCount',
    ]);
    activeRoomStatsGql = jasmine.createSpyObj('ActiveRoomStatsGql', ['fetch']);
    const apiConfigService = jasmine.createSpyObj('ApiConfigService', [
      'getApiConfig$',
    ]);
    /* Read late, so a test can set the UI config after this runs. */
    apiConfigService.getApiConfig$.and.callFake(() => of({ ui: uiConfig }));
    configureTestModule(
      [LiveIndicatorsComponent, getTranslocoModule()],
      [
        { provide: ApiConfigService, useValue: apiConfigService },
        { provide: SystemInfoService, useValue: systemInfoService },
        { provide: ActiveRoomStatsGql, useValue: activeRoomStatsGql },
      ]
    );
  });

  it('should pass the thresholds configured in the UI config as variables', fakeAsync(() => {
    uiConfig = {
      admin: {
        indicators: { activeRooms: { minMemberCount: 3, windowMinutes: 60 } },
      },
    };
    systemInfoService.getConnectedUserCount.and.returnValue(of(42));
    activeRoomStatsGql.fetch.and.returnValue(activeRoomStatsResult(7));
    createComponent();
    expect(fetchVariables()).toEqual({
      minMemberCount: 3,
      activityWindowMinutes: 60,
    });
    discardPeriodicTasks();
  }));

  it('should omit the arguments when the UI config sets no thresholds', fakeAsync(() => {
    systemInfoService.getConnectedUserCount.and.returnValue(of(42));
    activeRoomStatsGql.fetch.and.returnValue(activeRoomStatsResult(7));
    createComponent();
    expect(fetchVariables()).toEqual({});
    discardPeriodicTasks();
  }));

  it('should omit only the threshold the UI config leaves unset', fakeAsync(() => {
    uiConfig = {
      admin: { indicators: { activeRooms: { windowMinutes: 60 } } },
    };
    systemInfoService.getConnectedUserCount.and.returnValue(of(42));
    activeRoomStatsGql.fetch.and.returnValue(activeRoomStatsResult(7));
    createComponent();
    expect(fetchVariables()).toEqual({ activityWindowMinutes: 60 });
    discardPeriodicTasks();
  }));

  it('should show both indicators once their values arrive', fakeAsync(() => {
    systemInfoService.getConnectedUserCount.and.returnValue(of(42));
    activeRoomStatsGql.fetch.and.returnValue(activeRoomStatsResult(7));
    createComponent();
    expect(countText('connected-users-indicator')).toBe('42');
    expect(countText('active-rooms-indicator')).toBe('7');
    expect(
      indicator('active-rooms-indicator')?.attributes['aria-label']
    ).toContain('admin.admin-area.indicator-value');
    discardPeriodicTasks();
  }));

  it('should show a large count in full', fakeAsync(() => {
    systemInfoService.getConnectedUserCount.and.returnValue(of(1234));
    activeRoomStatsGql.fetch.and.returnValue(activeRoomStatsResult(7));
    createComponent();
    expect(countText('connected-users-indicator')).toBe('1234');
    discardPeriodicTasks();
  }));

  it('should show a zero count rather than hiding the indicator', fakeAsync(() => {
    systemInfoService.getConnectedUserCount.and.returnValue(of(0));
    activeRoomStatsGql.fetch.and.returnValue(activeRoomStatsResult(0));
    createComponent();
    expect(countText('connected-users-indicator')).toBe('0');
    expect(countText('active-rooms-indicator')).toBe('0');
    discardPeriodicTasks();
  }));

  it('should hide the active rooms indicator when the query resolves to null', fakeAsync(() => {
    systemInfoService.getConnectedUserCount.and.returnValue(of(42));
    activeRoomStatsGql.fetch.and.returnValue(
      of({ data: { adminActiveRoomStats: null } })
    );
    createComponent();
    expect(indicator('active-rooms-indicator')).toBeNull();
    expect(indicator('connected-users-indicator')).not.toBeNull();
    discardPeriodicTasks();
  }));

  it('should recover on the next poll after the query resolved to null', fakeAsync(() => {
    systemInfoService.getConnectedUserCount.and.returnValue(of(42));
    activeRoomStatsGql.fetch.and.returnValues(
      of({ data: { adminActiveRoomStats: null } }),
      activeRoomStatsResult(3)
    );
    createComponent();
    expect(indicator('active-rooms-indicator')).toBeNull();

    tick(REFRESH_INTERVAL);
    fixture.detectChanges();
    expect(countText('active-rooms-indicator')).toBe('3');
    discardPeriodicTasks();
  }));

  it('should hide only the indicator whose value is undefined', fakeAsync(() => {
    systemInfoService.getConnectedUserCount.and.returnValue(of(undefined));
    activeRoomStatsGql.fetch.and.returnValue(activeRoomStatsResult(7));
    createComponent();
    expect(indicator('connected-users-indicator')).toBeNull();
    expect(indicator('active-rooms-indicator')).not.toBeNull();
    discardPeriodicTasks();
  }));

  it('should recover on the next poll after a failed request', fakeAsync(() => {
    systemInfoService.getConnectedUserCount.and.returnValues(
      of(undefined),
      of(5)
    );
    activeRoomStatsGql.fetch.and.returnValues(
      throwError(() => new Error('backend unavailable')),
      activeRoomStatsResult(3)
    );
    createComponent();
    expect(indicator('connected-users-indicator')).toBeNull();
    expect(indicator('active-rooms-indicator')).toBeNull();

    tick(REFRESH_INTERVAL);
    fixture.detectChanges();
    expect(countText('connected-users-indicator')).toBe('5');
    expect(countText('active-rooms-indicator')).toBe('3');
    discardPeriodicTasks();
  }));
});
