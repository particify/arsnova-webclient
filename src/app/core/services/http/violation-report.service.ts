import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ViolationReport } from '@app/core/models/violation-report';
import { AbstractHttpService } from '@app/core/services/http/abstract-http.service';
import { EventService } from '@app/core/services/util/event.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { TranslocoService } from '@ngneat/transloco';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ViolationReportService extends AbstractHttpService<void> {
  constructor(
    protected httpClient: HttpClient,
    protected eventService: EventService,
    protected translateService: TranslocoService,
    protected notificationService: NotificationService
  ) {
    super(
      '/violationreport',
      httpClient,
      eventService,
      translateService,
      notificationService
    );
  }

  postViolationReport(report: ViolationReport): Observable<ViolationReport> {
    const connectionUrl = this.buildUri('/');
    return this.httpClient.post<ViolationReport>(connectionUrl, report);
  }

  patchViolationReport(
    id: string,
    changes: object
  ): Observable<ViolationReport> {
    const url = this.buildUri(`/${id}?view=admin
    `);
    return this.httpClient.patch<ViolationReport>(url, changes);
  }

  getViolationReports(hasDecision: boolean): Observable<ViolationReport[]> {
    const connectionUrl = this.buildUri(
      `/?hasDecision=${hasDecision}&view=admin`
    );
    return this.httpClient.get<ViolationReport[]>(connectionUrl);
  }

  getReasonString(reason: string): string {
    return reason.toLowerCase().replaceAll(/_/g, '-');
  }

  getTargetTypeString(targetType: string): string {
    let type: string;
    switch (targetType) {
      case 'ContentGroupTemplate':
        type = 'template';
        break;
      case 'Room':
        type = 'room';
        break;
      default:
        type = 'content';
    }
    return type;
  }
}
