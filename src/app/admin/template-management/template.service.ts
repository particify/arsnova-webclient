import { Injectable } from '@angular/core';
import { TemplateTag } from '@app/core/models/template-tag';
import { BaseTemplateService } from '@app/core/services/http/base-template.service';
import { Observable } from 'rxjs';

@Injectable()
export class TemplateService extends BaseTemplateService {
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
