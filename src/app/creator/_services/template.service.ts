import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ContentGroupTemplate } from '@app/core/models/content-group-template';
import { BaseTemplateService } from '@app/core/services/http/base-template.service';
import { EventService } from '@app/core/services/util/event.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { TranslocoService } from '@ngneat/transloco';
import { Observable } from 'rxjs';

interface ContentGroupTemplateBody extends ContentGroupTemplate {
  contentGroupId: string;
}

@Injectable()
export class TemplateService extends BaseTemplateService {
  constructor(
    protected httpClient: HttpClient,
    protected eventService: EventService,
    protected translateService: TranslocoService,
    protected notificationService: NotificationService
  ) {
    super(httpClient, eventService, translateService, notificationService);
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

  createCopyFromContentGroupTemplate(
    templateId: string,
    roomId: string
  ): Observable<void> {
    const connectionUrl = this.buildUri(
      `/contentgroup/${templateId}/create-copy`
    );
    return this.httpClient.post<void>(connectionUrl, { roomId: roomId });
  }

  getContentGroupTemplates(
    tagIds?: string[],
    language?: string,
    creatorId?: string
  ): Observable<ContentGroupTemplate[]> {
    let connectionUrl = this.buildUri('/contentgroup');
    if (creatorId) {
      connectionUrl += `/?creatorId=${creatorId}`;
    } else if (tagIds && tagIds.length > 0) {
      connectionUrl += `/?tagIds=${tagIds.toString()}`;
    } else if (language) {
      connectionUrl += `/?language=${language}`;
    }
    return this.httpClient.get<ContentGroupTemplate[]>(connectionUrl);
  }
}
