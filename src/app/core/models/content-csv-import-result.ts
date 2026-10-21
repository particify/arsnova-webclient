export enum ContentCsvImportErrorReason {
  INCOMPATIBLE_FORMAT = 'INCOMPATIBLE_FORMAT',
  INVALID_FORMAT_DATA = 'INVALID_FORMAT_DATA',
  MALFORMED_RECORD = 'MALFORMED_RECORD',
  MISSING_BODY = 'MISSING_BODY',
  UNKNOWN_FORMAT = 'UNKNOWN_FORMAT',
}

export interface ContentCsvImportError {
  /** Counts entries after the header row, not lines of the file. */
  line: number;
  reason: ContentCsvImportErrorReason;
  message?: string | null;
}

export interface ContentCsvImportResult {
  totalLines: number;
  importedLines: number;
  errorLines: ContentCsvImportError[];
}
