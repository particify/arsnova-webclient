import {
  HttpClient,
  HttpContext,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, pipe } from 'rxjs';

const ERROR_RATE = 1.0 / 3;

function fakeError(url: string) {
  return pipe(
    map((response) => {
      if (url.startsWith('/api/') && Math.random() < ERROR_RATE) {
        console.log(`Emitting fake HTTP error for ${url}.`);
        const e = new HttpErrorResponse({
          status: 599,
          statusText: 'Fake HTTP error',
          url: url,
        });
        throw e;
      }
      return response;
    })
  );
}

/**
 * This is a replacement for Angular's HttpClient which replaces some of the
 * responses with artificial HTTP error responses. It is intended for
 * development only.
 *
 * To enable the behavior, add this as a provider to the AppModule:
 * { provide: HttpClient, useClass: ErrorInducingHttpClient }
 */
@Injectable()
export class ErrorInducingHttpClient extends HttpClient {
  constructor() {
    const httpHander = inject(HttpHandler);

    super(httpHander);
    console.warn('Using ErrorInducingHttpClient.');
  }

  override get(
    url: string,
    options: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | {
            [param: string]:
              | string
              | number
              | boolean
              | readonly (string | number | boolean)[];
          };
      reportProgress?: boolean;
      responseType: 'arraybuffer';
      withCredentials?: boolean;
    }
  ): Observable<ArrayBuffer>;
  override get(
    url: string,
    options: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | {
            [param: string]:
              | string
              | number
              | boolean
              | readonly (string | number | boolean)[];
          };
      reportProgress?: boolean;
      responseType: 'blob';
      withCredentials?: boolean;
    }
  ): Observable<Blob>;
  override get(
    url: string,
    options: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | {
            [param: string]:
              | string
              | number
              | boolean
              | readonly (string | number | boolean)[];
          };
      reportProgress?: boolean;
      responseType: 'text';
      withCredentials?: boolean;
    }
  ): Observable<string>;
  override get(
    url: string,
    options: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | {
            [param: string]:
              | string
              | number
              | boolean
              | readonly (string | number | boolean)[];
          };
      reportProgress?: boolean;
      responseType: 'arraybuffer';
      withCredentials?: boolean;
    }
  ): Observable<HttpEvent<ArrayBuffer>>;
  override get(
    url: string,
    options: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | {
            [param: string]:
              | string
              | number
              | boolean
              | readonly (string | number | boolean)[];
          };
      reportProgress?: boolean;
      responseType: 'blob';
      withCredentials?: boolean;
    }
  ): Observable<HttpEvent<Blob>>;
  override get(
    url: string,
    options: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | {
            [param: string]:
              | string
              | number
              | boolean
              | readonly (string | number | boolean)[];
          };
      reportProgress?: boolean;
      responseType: 'text';
      withCredentials?: boolean;
    }
  ): Observable<HttpEvent<string>>;
  override get(
    url: string,
    options: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | {
            [param: string]:
              | string
              | number
              | boolean
              | readonly (string | number | boolean)[];
          };
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
    }
  ): Observable<HttpEvent<object>>;
  override get<T>(
    url: string,
    options: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | {
            [param: string]:
              | string
              | number
              | boolean
              | readonly (string | number | boolean)[];
          };
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
    }
  ): Observable<HttpEvent<T>>;
  override get(
    url: string,
    options: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | {
            [param: string]:
              | string
              | number
              | boolean
              | readonly (string | number | boolean)[];
          };
      reportProgress?: boolean;
      responseType: 'arraybuffer';
      withCredentials?: boolean;
    }
  ): Observable<HttpResponse<ArrayBuffer>>;
  override get(
    url: string,
    options: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | {
            [param: string]:
              | string
              | number
              | boolean
              | readonly (string | number | boolean)[];
          };
      reportProgress?: boolean;
      responseType: 'blob';
      withCredentials?: boolean;
    }
  ): Observable<HttpResponse<Blob>>;
  override get(
    url: string,
    options: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | {
            [param: string]:
              | string
              | number
              | boolean
              | readonly (string | number | boolean)[];
          };
      reportProgress?: boolean;
      responseType: 'text';
      withCredentials?: boolean;
    }
  ): Observable<HttpResponse<string>>;
  override get(
    url: string,
    options: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | {
            [param: string]:
              | string
              | number
              | boolean
              | readonly (string | number | boolean)[];
          };
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
    }
  ): Observable<HttpResponse<object>>;
  override get<T>(
    url: string,
    options: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | {
            [param: string]:
              | string
              | number
              | boolean
              | readonly (string | number | boolean)[];
          };
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
    }
  ): Observable<HttpResponse<T>>;
  override get(
    url: string,
    options?: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | {
            [param: string]:
              | string
              | number
              | boolean
              | readonly (string | number | boolean)[];
          };
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
    }
  ): Observable<object>;
  override get<T>(
    url: string,
    options?: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | {
            [param: string]:
              | string
              | number
              | boolean
              | readonly (string | number | boolean)[];
          };
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
    }
  ): Observable<T>;
  override get(
    url: string,
    options?: unknown
  ):
    | Observable<ArrayBuffer>
    | Observable<Blob>
    | Observable<string>
    | Observable<HttpEvent<ArrayBuffer>>
    | Observable<HttpEvent<Blob>>
    | Observable<HttpEvent<string>>
    | Observable<HttpResponse<ArrayBuffer>>
    | Observable<HttpResponse<Blob>>
    | Observable<HttpResponse<string>>
    | Observable<HttpResponse<object>>
    | Observable<object>
    | Observable<HttpEvent<object>>
    | Observable<HttpEvent<unknown>>
    | Observable<HttpResponse<unknown>>
    | Observable<unknown> {
    return super.get(url as string, options).pipe(fakeError(url));
  }

  override post(
    url: string,
    body: any,
    options: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | {
            [param: string]:
              | string
              | number
              | boolean
              | readonly (string | number | boolean)[];
          };
      reportProgress?: boolean;
      responseType: 'arraybuffer';
      withCredentials?: boolean;
    }
  ): Observable<ArrayBuffer>;
  override post(
    url: string,
    body: any,
    options: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | {
            [param: string]:
              | string
              | number
              | boolean
              | readonly (string | number | boolean)[];
          };
      reportProgress?: boolean;
      responseType: 'blob';
      withCredentials?: boolean;
    }
  ): Observable<Blob>;
  override post(
    url: string,
    body: any,
    options: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | {
            [param: string]:
              | string
              | number
              | boolean
              | readonly (string | number | boolean)[];
          };
      reportProgress?: boolean;
      responseType: 'text';
      withCredentials?: boolean;
    }
  ): Observable<string>;
  override post(
    url: string,
    body: any,
    options: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | {
            [param: string]:
              | string
              | number
              | boolean
              | readonly (string | number | boolean)[];
          };
      reportProgress?: boolean;
      responseType: 'arraybuffer';
      withCredentials?: boolean;
    }
  ): Observable<HttpEvent<ArrayBuffer>>;
  override post(
    url: string,
    body: any,
    options: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | {
            [param: string]:
              | string
              | number
              | boolean
              | readonly (string | number | boolean)[];
          };
      reportProgress?: boolean;
      responseType: 'blob';
      withCredentials?: boolean;
    }
  ): Observable<HttpEvent<Blob>>;
  override post(
    url: string,
    body: any,
    options: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | {
            [param: string]:
              | string
              | number
              | boolean
              | readonly (string | number | boolean)[];
          };
      reportProgress?: boolean;
      responseType: 'text';
      withCredentials?: boolean;
    }
  ): Observable<HttpEvent<string>>;
  override post(
    url: string,
    body: any,
    options: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | {
            [param: string]:
              | string
              | number
              | boolean
              | readonly (string | number | boolean)[];
          };
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
    }
  ): Observable<HttpEvent<object>>;
  override post<T>(
    url: string,
    body: any,
    options: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | {
            [param: string]:
              | string
              | number
              | boolean
              | readonly (string | number | boolean)[];
          };
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
    }
  ): Observable<HttpEvent<T>>;
  override post(
    url: string,
    body: any,
    options: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | {
            [param: string]:
              | string
              | number
              | boolean
              | readonly (string | number | boolean)[];
          };
      reportProgress?: boolean;
      responseType: 'arraybuffer';
      withCredentials?: boolean;
    }
  ): Observable<HttpResponse<ArrayBuffer>>;
  override post(
    url: string,
    body: any,
    options: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | {
            [param: string]:
              | string
              | number
              | boolean
              | readonly (string | number | boolean)[];
          };
      reportProgress?: boolean;
      responseType: 'blob';
      withCredentials?: boolean;
    }
  ): Observable<HttpResponse<Blob>>;
  override post(
    url: string,
    body: any,
    options: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | {
            [param: string]:
              | string
              | number
              | boolean
              | readonly (string | number | boolean)[];
          };
      reportProgress?: boolean;
      responseType: 'text';
      withCredentials?: boolean;
    }
  ): Observable<HttpResponse<string>>;
  override post(
    url: string,
    body: any,
    options: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | {
            [param: string]:
              | string
              | number
              | boolean
              | readonly (string | number | boolean)[];
          };
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
    }
  ): Observable<HttpResponse<object>>;
  override post<T>(
    url: string,
    body: any,
    options: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      observe: 'response';
      context?: HttpContext;
      params?:
        | HttpParams
        | {
            [param: string]:
              | string
              | number
              | boolean
              | readonly (string | number | boolean)[];
          };
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
    }
  ): Observable<HttpResponse<T>>;
  override post(
    url: string,
    body: any,
    options?: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | {
            [param: string]:
              | string
              | number
              | boolean
              | readonly (string | number | boolean)[];
          };
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
    }
  ): Observable<object>;
  override post<T>(
    url: string,
    body: any,
    options?: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | {
            [param: string]:
              | string
              | number
              | boolean
              | readonly (string | number | boolean)[];
          };
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
    }
  ): Observable<T>;
  override post(
    url: string,
    body: unknown,
    options?: unknown
  ):
    | Observable<ArrayBuffer>
    | Observable<Blob>
    | Observable<string>
    | Observable<HttpEvent<ArrayBuffer>>
    | Observable<HttpEvent<Blob>>
    | Observable<HttpEvent<string>>
    | Observable<HttpResponse<ArrayBuffer>>
    | Observable<HttpResponse<Blob>>
    | Observable<HttpResponse<string>>
    | Observable<HttpResponse<object>>
    | Observable<object>
    | Observable<HttpEvent<object>>
    | Observable<HttpEvent<unknown>>
    | Observable<HttpResponse<unknown>>
    | Observable<unknown> {
    return super.post(url, body, options).pipe(fakeError(url));
  }
}
