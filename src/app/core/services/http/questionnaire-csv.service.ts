import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ContentCsvImportResult } from '@app/core/models/content-csv-import-result';
import { DelimitedTextFormat } from '@app/core/models/delimited-text-format';
import { AbstractHttpService } from '@app/core/services/http/abstract-http.service';
import { DelimitedTextCharset } from '@app/core/utils/delimited-text';
import { Observable, catchError } from 'rxjs';

/** Exports and imports the contents of a questionnaire as delimited text. */
@Injectable()
export class QuestionnaireCsvService extends AbstractHttpService<void> {
  constructor() {
    super('/questionnaire');
  }

  /** The file as the server encodes it, with a byte order mark for UTF-16LE. */
  exportContents(
    questionnaireId: string,
    format: DelimitedTextFormat,
    charset: DelimitedTextCharset
  ): Observable<Blob> {
    return this.http
      .get(this.buildUri(`/${questionnaireId}/contents-export`), {
        params: new HttpParams().set('format', format).set('charset', charset),
        responseType: 'blob',
      })
      .pipe(catchError(this.handleError<Blob>('exportContents')));
  }

  /** The server detects the delimiter and the charset of the file itself. */
  importContents(
    questionnaireId: string,
    file: Blob
  ): Observable<ContentCsvImportResult> {
    const data = new FormData();
    data.append('file', file);
    return this.http
      .post<ContentCsvImportResult>(
        this.buildUri(`/${questionnaireId}/contents-import`),
        data
      )
      .pipe(
        catchError(
          this.handleError<ContentCsvImportResult>(
            'importContents',
            undefined,
            'creator.content.import-failed'
          )
        )
      );
  }
}
