import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { TemplateTag } from '@app/core/models/template-tag';
import { BaseTemplateService } from '@app/core/services/http/base-template.service';
import { EventService } from '@app/core/services/util/event.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { TranslocoService } from '@jsverse/transloco';
import { Observable } from 'rxjs';

@Injectable()
export class TemplateService extends BaseTemplateService {
  protected httpClient: HttpClient;
  protected eventService: EventService;
  protected translateService: TranslocoService;
  protected notificationService: NotificationService;

  constructor() {
    const httpClient = inject(HttpClient);
    const eventService = inject(EventService);
    const translateService = inject(TranslocoService);
    const notificationService = inject(NotificationService);

    super(httpClient, eventService, translateService, notificationService);

    this.httpClient = httpClient;
    this.eventService = eventService;
    this.translateService = translateService;
    this.notificationService = notificationService;
  }

  patchTemplateTag(tagId: string, changes: object): Observable<TemplateTag> {
    const connectionUrl = this.buildUri(`/tag/${tagId}`);
    return this.httpClient.patch<TemplateTag>(connectionUrl, changes);
  }

  deleteTemplateTag(tagId: string): Observable<void> {
    const connectionUrl = this.buildUri(`/tag/${tagId}`);
    return this.httpClient.delete<void>(connectionUrl);
  }

  deleteTemplate(templateId: string): Observable<void> {
    const connectionUrl = this.buildUri(`/contentgroup/${templateId}`);
    return this.httpClient.delete<void>(connectionUrl);
  }
}
