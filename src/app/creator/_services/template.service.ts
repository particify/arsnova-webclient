import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ContentGroupTemplate } from '@app/core/models/content-group-template';
import { BaseTemplateService } from '@app/core/services/http/base-template.service';
import { EventService } from '@app/core/services/util/event.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { TranslocoService } from '@jsverse/transloco';
import { Observable } from 'rxjs';

interface ContentGroupTemplateBody extends ContentGroupTemplate {
  contentGroupId: string;
}

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

  addContentGroupTemplate(
    template: ContentGroupTemplate,
    contentGroupId: string
  ): Observable<ContentGroupTemplate> {
    const connectionUrl = this.buildUri('/contentgroup/from-existing');
    const body = template as ContentGroupTemplateBody;
    body.contentGroupId = contentGroupId;
    return this.httpClient.post<ContentGroupTemplate>(connectionUrl, template);
  }
}
