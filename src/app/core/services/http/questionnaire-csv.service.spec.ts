import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ContentCsvImportResult } from '@app/core/models/content-csv-import-result';
import { DelimitedTextFormat } from '@app/core/models/delimited-text-format';
import { NotificationService } from '@app/core/services/util/notification.service';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { QuestionnaireCsvService } from './questionnaire-csv.service';

describe('QuestionnaireCsvService', () => {
  let service: QuestionnaireCsvService;
  let http: HttpTestingController;
  let notificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    notificationService = jasmine.createSpyObj('NotificationService', [
      'showAdvanced',
    ]);
    configureTestModule(
      [getTranslocoModule()],
      [
        QuestionnaireCsvService,
        { provide: NotificationService, useValue: notificationService },
      ]
    );
    service = TestBed.inject(QuestionnaireCsvService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests the contents as a file in the chosen format and charset', () => {
    let blob: Blob | undefined;
    service
      .exportContents('q-1', DelimitedTextFormat.TSV, 'UTF-16LE')
      .subscribe((b) => (blob = b));

    const request = http.expectOne(
      (r) => r.url === '/api/questionnaire/q-1/contents-export'
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('format')).toBe('TSV');
    expect(request.request.params.get('charset')).toBe('UTF-16LE');
    expect(request.request.responseType).toBe('blob');
    request.flush(new Blob(['format\tbody']));
    expect(blob).toBeDefined();
  });

  it('uploads the file as a multipart part and returns the result', () => {
    const file = new File(['format,body'], 'contents.csv');
    const result: ContentCsvImportResult = {
      totalLines: 1,
      importedLines: 1,
      errorLines: [],
    };
    let received: ContentCsvImportResult | undefined;
    service.importContents('q-1', file).subscribe((r) => (received = r));

    const request = http.expectOne(
      (r) => r.url === '/api/questionnaire/q-1/contents-import'
    );
    expect(request.request.method).toBe('POST');
    expect((request.request.body as FormData).get('file')).toBe(file);
    request.flush(result);
    expect(received).toEqual(result);
  });

  it('reports a file the server rejects', () => {
    let failed = false;
    service.importContents('q-1', new Blob()).subscribe({
      error: () => (failed = true),
    });

    http
      .expectOne(() => true)
      .flush({}, { status: 400, statusText: 'Bad Request' });

    expect(failed).toBeTrue();
    expect(notificationService.showAdvanced).toHaveBeenCalledWith(
      'creator.content.import-failed',
      jasmine.anything()
    );
  });
});
