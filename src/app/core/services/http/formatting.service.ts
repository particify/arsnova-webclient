import { Injectable } from '@angular/core';
import { AbstractHttpService } from './abstract-http.service';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';

export enum MarkdownFeatureset {
  MINIMUM = 'MINIMUM',
  SIMPLE = 'SIMPLE',
  EXTENDED = 'EXTENDED',
}

export interface FormattingOptions {
  markdown: boolean;
  latex: boolean;
  syntaxHighlighting: boolean;
  markdownFeatureset: MarkdownFeatureset;
  linebreaks: boolean;
}

@Injectable()
export class FormattingService extends AbstractHttpService<void> {
  serviceApiUrl = {
    render: '/render',
  };

  constructor() {
    super('/_util/formatting');
  }

  postString(text: string, options?: FormattingOptions): Observable<any> {
    options = options ?? {
      markdown: true,
      latex: false,
      syntaxHighlighting: false,
      markdownFeatureset: MarkdownFeatureset.EXTENDED,
      linebreaks: true,
    };
    const url = this.buildUri(this.serviceApiUrl.render);
    const body = {
      text: text,
      options: options,
    };
    return this.http
      .post<any>(url, body)
      .pipe(catchError(this.handleError('postString', body)));
  }

  containsTextAnImage(text: string): boolean {
    return /!\[.*?\]\(.*?\)/.test(text);
  }
}
