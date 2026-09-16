import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  StatisticTileComponent,
  VALUE_PLACEHOLDER,
} from '@app/admin/statistic-tile/statistic-tile.component';
import { UiConfig } from '@app/core/models/api-config';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { AdminRoomActivityStatsGql } from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import dayjs from 'dayjs';
import { NEVER, Observable, of, throwError } from 'rxjs';

import { StatisticsSummaryComponent } from './statistics-summary.component';

interface RangeVariables {
  from: string;
  to: string;
}

/* The period is relative, so `to` is whatever "now" was when the query went out. */
const NOW_TOLERANCE_MS = 5000;
const DEFAULT_RANGE_DAYS = 90;

describe('StatisticsSummaryComponent', () => {
  let fixture: ComponentFixture<StatisticsSummaryComponent>;
  let adminRoomActivityStatsGql: jasmine.SpyObj<{
    fetch: (options: { variables: RangeVariables }) => Observable<unknown>;
  }>;
  let uiConfig: UiConfig;

  function activityStatsResult(
    managingUserCount: number,
    participantCount: number,
    roomCount: number
  ): Observable<unknown> {
    return of({
      data: {
        adminRoomActivityStats: {
          managingUserCount: managingUserCount,
          participantCount: participantCount,
          roomCount: roomCount,
        },
      },
    });
  }

  function createComponent(): void {
    fixture = TestBed.createComponent(StatisticsSummaryComponent);
    fixture.detectChanges();
  }

  function fetchVariables(): RangeVariables {
    return adminRoomActivityStatsGql.fetch.calls.mostRecent().args[0].variables;
  }

  /** The requested period length, read back from the variables the query was issued with. */
  function requestedDays(): number {
    const { from, to } = fetchVariables();
    return dayjs(to).diff(dayjs(from), 'day');
  }

  function tiles(): StatisticTileComponent[] {
    return fixture.debugElement
      .queryAll(By.directive(StatisticTileComponent))
      .map((tile) => tile.componentInstance);
  }

  function tileContent(tileTestId: string, part: string): string | undefined {
    const element: DebugElement | null = fixture.debugElement.query(
      By.css(
        `[data-testid="${tileTestId}"] [data-testid="statistic-tile-${part}"]`
      )
    );
    return element?.nativeElement.textContent.trim();
  }

  beforeEach(() => {
    uiConfig = {};
    adminRoomActivityStatsGql = jasmine.createSpyObj(
      'AdminRoomActivityStatsGql',
      ['fetch']
    );
    adminRoomActivityStatsGql.fetch.and.returnValue(
      activityStatsResult(3, 17, 8)
    );
    const apiConfigService = jasmine.createSpyObj('ApiConfigService', [
      'getApiConfig$',
    ]);
    /* Read late, so a test can set the UI config after this runs. */
    apiConfigService.getApiConfig$.and.callFake(() => of({ ui: uiConfig }));
    configureTestModule(
      [StatisticsSummaryComponent, getTranslocoModule()],
      [
        { provide: ApiConfigService, useValue: apiConfigService },
        {
          provide: AdminRoomActivityStatsGql,
          useValue: adminRoomActivityStatsGql,
        },
      ]
    );
  });

  it('should render the three activity values', () => {
    createComponent();
    expect(tileContent('managing-users-tile', 'value')).toBe('3');
    expect(tileContent('participants-tile', 'value')).toBe('17');
    expect(tileContent('rooms-tile', 'value')).toBe('8');
  });

  it('should label the three tiles', () => {
    createComponent();
    expect(tileContent('managing-users-tile', 'label')).toBe(
      'admin.admin-area.managing-users'
    );
    expect(tileContent('participants-tile', 'label')).toBe(
      'admin.admin-area.participants'
    );
    expect(tileContent('rooms-tile', 'label')).toBe('admin.admin-area.rooms');
  });

  it('should show a placeholder instead of a blank while a value is absent', () => {
    adminRoomActivityStatsGql.fetch.and.returnValue(NEVER);
    createComponent();
    expect(tileContent('managing-users-tile', 'value')).toBe(VALUE_PLACEHOLDER);
    expect(tileContent('participants-tile', 'value')).toBe(VALUE_PLACEHOLDER);
    expect(tileContent('rooms-tile', 'value')).toBe(VALUE_PLACEHOLDER);
  });

  /*
   * The heading is bound to the same params object as the tiles, so asserting that every tile got
   * the one instance covers the heading too - they cannot disagree about the period.
   */
  it('should interpolate one period into the heading and every tile description', () => {
    createComponent();
    const params = tiles().map((tile) => tile.descriptionParams());
    expect(params.length).toBe(3);
    expect(params[0]).toEqual({ days: DEFAULT_RANGE_DAYS });
    expect(params[1]).toBe(params[0]);
    expect(params[2]).toBe(params[0]);
  });

  it('should query the default period exactly once', () => {
    createComponent();
    expect(adminRoomActivityStatsGql.fetch).toHaveBeenCalledTimes(1);
    expect(requestedDays()).toBe(DEFAULT_RANGE_DAYS);
    expect(Math.abs(dayjs().diff(dayjs(fetchVariables().to)))).toBeLessThan(
      NOW_TOLERANCE_MS
    );
  });

  it('should use the period configured in the UI config', () => {
    uiConfig = { admin: { statistics: { summaryRangeDays: 30 } } };
    createComponent();
    expect(requestedDays()).toBe(30);
    expect(Math.abs(dayjs().diff(dayjs(fetchVariables().to)))).toBeLessThan(
      NOW_TOLERANCE_MS
    );
    expect(tiles()[0].descriptionParams()).toEqual({ days: 30 });
  });

  const unusableValues: [string, unknown][] = [
    ['a string', '30'],
    ['zero', 0],
    ['negative', -5],
    ['fractional', 30.5],
    ['not a number', Number.NaN],
  ];
  for (const [description, value] of unusableValues) {
    it(`should fall back to the default period when the configured value is ${description}`, () => {
      uiConfig = { admin: { statistics: { summaryRangeDays: value } } };
      createComponent();
      expect(requestedDays()).toBe(DEFAULT_RANGE_DAYS);
    });
  }

  it('should keep the tiles rendered when the query fails', () => {
    adminRoomActivityStatsGql.fetch.and.returnValue(
      throwError(() => new Error('query failed'))
    );
    createComponent();
    expect(tileContent('managing-users-tile', 'value')).toBe(VALUE_PLACEHOLDER);
    expect(tileContent('participants-tile', 'value')).toBe(VALUE_PLACEHOLDER);
    expect(tileContent('rooms-tile', 'value')).toBe(VALUE_PLACEHOLDER);
  });
});
