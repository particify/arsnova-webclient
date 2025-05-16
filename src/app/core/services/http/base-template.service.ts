import { Injectable } from '@angular/core';
import { Content } from '@app/core/models/content';
import { ContentGroupTemplate } from '@app/core/models/content-group-template';
import { TemplateTag } from '@app/core/models/template-tag';
import { AbstractHttpService } from '@app/core/services/http/abstract-http.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BaseTemplateService extends AbstractHttpService<void> {
  constructor() {
    super('/template');
  }

  getTemplateTags(lang: string, verified = true): Observable<TemplateTag[]> {
    let connectionUrl = this.buildUri(`/tag/?language=${lang}`);
    if (!verified) {
      connectionUrl += '&verified=false';
    }
    return this.http.get<TemplateTag[]>(connectionUrl);
  }

  getContentTemplates(templateIds: string[]): Observable<Content[]> {
    const connectionUrl = this.buildUri(
      `/content/?ids=${templateIds.toString()}`
    );
    return this.http.get<Content[]>(connectionUrl);
  }

  createCopyFromContentGroupTemplate(
    templateId: string,
    roomId: string
  ): Observable<void> {
    const connectionUrl = this.buildForeignUri(
      `/contentgroup/-/create-from-template`,
      roomId
    );
    return this.http.post<void>(connectionUrl, {
      id: templateId,
      roomId: roomId,
    });
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
    return this.http.get<ContentGroupTemplate[]>(connectionUrl);
  }

  getContentGroupTemplate(
    templateId: string
  ): Observable<ContentGroupTemplate> {
    const connectionUrl = this.buildUri(`/contentgroup/${templateId}`);
    return this.http.get<ContentGroupTemplate>(connectionUrl);
  }

  updateContentGroupTemplate(
    template: ContentGroupTemplate
  ): Observable<ContentGroupTemplate> {
    const connectionUrl = this.buildUri(`/contentgroup/${template.id}`);
    return this.http.put<ContentGroupTemplate>(connectionUrl, template);
  }

  deleteContentGroupTemplate(
    templateId: string
  ): Observable<ContentGroupTemplate> {
    const connectionUrl = this.buildUri(`/contentgroup/${templateId}`);
    return this.http.delete<ContentGroupTemplate>(connectionUrl);
  }
}
