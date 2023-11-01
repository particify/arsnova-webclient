import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Content } from '@app/core/models/content';
import { TemplateTag } from '@app/core/models/template-tag';
import { AbstractHttpService } from '@app/core/services/http/abstract-http.service';
import { EventService } from '@app/core/services/util/event.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { TranslocoService } from '@ngneat/transloco';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BaseTemplateService extends AbstractHttpService<void> {
  constructor(
    protected httpClient: HttpClient,
    protected eventService: EventService,
    protected translateService: TranslocoService,
    protected notificationService: NotificationService
  ) {
    super(
      '/template',
      httpClient,
      eventService,
      translateService,
      notificationService
    );
  }

  getTemplateTags(lang: string, verified = true): Observable<TemplateTag[]> {
    let connectionUrl = this.buildUri(`/tag/?language=${lang}`);
    if (!verified) {
      connectionUrl += '&verified=false';
    }
    return this.httpClient.get<TemplateTag[]>(connectionUrl);
  }

  getContentTemplates(templateIds: string[]): Observable<Content[]> {
    const connectionUrl = this.buildUri(
      `/content/?ids=${templateIds.toString()}`
    );
    return this.httpClient.get<Content[]>(connectionUrl);
  }
}
