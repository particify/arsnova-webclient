import { Injectable } from '@angular/core';
import { ContentGroupTemplate } from '@app/core/models/content-group-template';
import { BaseTemplateService } from '@app/core/services/http/base-template.service';
import { Observable } from 'rxjs';

interface ContentGroupTemplateBody extends ContentGroupTemplate {
  contentGroupId: string;
}

@Injectable()
export class TemplateService extends BaseTemplateService {
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
