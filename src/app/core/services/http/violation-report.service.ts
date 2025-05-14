import { Injectable } from '@angular/core';
import { ViolationReport } from '@app/core/models/violation-report';
import { AbstractHttpService } from '@app/core/services/http/abstract-http.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ViolationReportService extends AbstractHttpService<void> {
  constructor() {
    super('/violationreport');
  }

  postViolationReport(report: ViolationReport): Observable<ViolationReport> {
    const connectionUrl = this.buildUri('/');
    return this.http.post<ViolationReport>(connectionUrl, report);
  }

  patchViolationReport(
    id: string,
    changes: object
  ): Observable<ViolationReport> {
    const url = this.buildUri(`/${id}?view=admin
    `);
    return this.http.patch<ViolationReport>(url, changes);
  }

  getViolationReports(hasDecision: boolean): Observable<ViolationReport[]> {
    const connectionUrl = this.buildUri(
      `/?hasDecision=${hasDecision}&view=admin`
    );
    return this.http.get<ViolationReport[]>(connectionUrl);
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
