import { Injectable } from '@angular/core';
import { BaseHttpService } from './base-http.service';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class FormattingService extends BaseHttpService {

  private apiUrl = {
    base: '/api',
    util: '/_util',
    formatting: '/formatting',
    render: '/render'
  };

  constructor(private http: HttpClient) {
    super();
  }

  postString(text: string): Observable<any> {
    const url = this.apiUrl.base + this.apiUrl.util + this.apiUrl.formatting + this.apiUrl.render;
    const body = {
      text: text,
      options: {
        markdown: true,
        latex: false,
        markdownFeatureset: 'extended'
      }
    };
    return this.http.post<any>(url, body).pipe(
      catchError(this.handleError('postString', body))
    );
  }
}
