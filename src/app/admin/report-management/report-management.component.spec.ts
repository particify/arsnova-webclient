import {
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
} from '@angular/core/testing';
import { DialogService } from '@app/core/services/util/dialog.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import {
  ViolationReportDecision,
  ViolationReportDetailsFragment,
  ViolationReportReason,
  ViolationReportTargetType,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { of } from 'rxjs';
import { ReportManagementComponent } from './report-management.component';

function createReport(
  id: string,
  decision: ViolationReportDecision | null = null
): ViolationReportDetailsFragment {
  return {
    __typename: 'ViolationReport',
    id,
    targetId: 't-' + id,
    targetType: ViolationReportTargetType.Template,
    reason: ViolationReportReason.Other,
    description: 'description',
    decision,
    createdAt: '2026-10-30T00:00:00Z',
    updatedAt: null,
  };
}

function createPage(
  reports: ViolationReportDetailsFragment[],
  hasNextPage: boolean
) {
  return {
    adminViolationReportsByDecided: {
      __typename: 'ViolationReportConnection',
      edges: reports.map((node) => ({
        __typename: 'ViolationReportEdge',
        cursor: 'cursor-' + node.id,
        node,
      })),
      pageInfo: {
        __typename: 'PageInfo',
        endCursor: reports.length
          ? 'cursor-' + reports[reports.length - 1].id
          : null,
        hasNextPage,
        hasPreviousPage: false,
        startCursor: reports.length ? 'cursor-' + reports[0].id : null,
      },
    },
  };
}

describe('ReportManagementComponent', () => {
  let fixture: ComponentFixture<ReportManagementComponent>;
  let component: ReportManagementComponent;
  let httpMock: HttpTestingController;
  let dialogService: jasmine.SpyObj<DialogService>;

  const report = createReport('report-1');

  function expectOperation(operationName: string): TestRequest {
    return httpMock.expectOne(
      (req) =>
        req.url === '/api/graphql' && req.body?.operationName === operationName
    );
  }

  function respond(request: TestRequest, data: object) {
    request.flush({ data });
    flush();
  }

  function respondToReports(
    variables: object,
    reports: ViolationReportDetailsFragment[],
    hasNextPage: boolean
  ) {
    const request = expectOperation('AdminViolationReportsByDecided');
    expect(request.request.body.variables).toEqual(variables);
    respond(request, createPage(reports, hasNextPage));
  }

  beforeEach(fakeAsync(() => {
    dialogService = jasmine.createSpyObj('DialogService', ['openDeleteDialog']);
    dialogService.openDeleteDialog.and.callFake(
      (_suffix, _body, _element, _label, confirmAction) => {
        confirmAction?.().subscribe();
        return { afterClosed: () => of(true) } as never;
      }
    );
    TestBed.overrideComponent(ReportManagementComponent, {
      set: { template: '' },
    });
    configureTestModule(
      [getTranslocoModule(), ReportManagementComponent],
      [
        { provide: DialogService, useValue: dialogService },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', [
            'showAdvanced',
          ]),
        },
      ]
    ).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ReportManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    flush();
    respondToReports({ decided: false }, [report], true);
  }));

  afterEach(() => {
    httpMock.verify();
  });

  it('loads the open reports', () => {
    expect(component.isLoading()).toBeFalse();
    expect(component.reports()).toEqual([report]);
    expect(component.hasMore()).toBeTrue();
  });

  it('appends the next page after the end cursor', fakeAsync(() => {
    const next = createReport('report-2');
    component.loadMore();
    flush();
    expect(component.isLoadingMore()).toBeTrue();
    respondToReports(
      { decided: false, cursor: 'cursor-report-1' },
      [next],
      false
    );
    expect(component.isLoadingMore()).toBeFalse();
    expect(component.reports()).toEqual([report, next]);
    expect(component.hasMore()).toBeFalse();
  }));

  it('loads the closed reports when switching tabs', fakeAsync(() => {
    const closed = createReport('report-3', ViolationReportDecision.Invalid);
    component.switchList(1);
    flush();
    expect(component.isLoading()).toBeTrue();
    respondToReports({ decided: true }, [closed], false);
    expect(component.isLoading()).toBeFalse();
    expect(component.reports()).toEqual([closed]);
    expect(component.hasMore()).toBeFalse();
  }));

  it('shows the cached open reports while revalidating them', fakeAsync(() => {
    const added = createReport('report-4');
    component.switchList(1);
    flush();
    respondToReports({ decided: true }, [], false);
    component.switchList(0);
    flush();
    expect(component.isLoading()).toBeFalse();
    expect(component.reports()).toEqual([report]);
    respondToReports({ decided: false }, [report, added], false);
    expect(component.reports()).toEqual([report, added]);
  }));

  it('removes a report decided as a removal from the list', fakeAsync(() => {
    component.openSubmitDialog(report, true);
    const request = expectOperation('AdminDecideViolationReport');
    expect(request.request.body.variables).toEqual({
      id: 'report-1',
      decision: ViolationReportDecision.Removal,
    });
    respond(request, {
      adminDecideViolationReport: createReport(
        'report-1',
        ViolationReportDecision.Removal
      ),
    });
    expect(component.reports()).toEqual([]);
  }));

  it('removes a report decided as invalid from the list', fakeAsync(() => {
    component.openSubmitDialog(report, false);
    const request = expectOperation('AdminDecideViolationReport');
    expect(request.request.body.variables).toEqual({
      id: 'report-1',
      decision: ViolationReportDecision.Invalid,
    });
    respond(request, {
      adminDecideViolationReport: createReport(
        'report-1',
        ViolationReportDecision.Invalid
      ),
    });
    expect(component.reports()).toEqual([]);
  }));
});
