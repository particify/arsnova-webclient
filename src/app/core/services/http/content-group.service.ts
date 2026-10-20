import { Injectable, inject } from '@angular/core';
import { ContentGroup } from '@app/core/models/content-group';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import {
  Content,
  ContentType,
  QuestionnaireType,
} from '@gql/generated/graphql';

@Injectable()
export class ContentGroupService {
  private readonly globalStorageService = inject(GlobalStorageService);
  questionnaireTypeIcons: Map<QuestionnaireType, string> = new Map<
    QuestionnaireType,
    string
  >([
    [QuestionnaireType.Mixed, 'dashboard'],
    [QuestionnaireType.Quiz, 'sports_esports'],
    [QuestionnaireType.Survey, 'tune'],
    [QuestionnaireType.Flashcards, 'school'],
  ]);

  saveGroupInMemoryStorage(newGroup: string): boolean {
    if (newGroup === '') {
      return false;
    }
    this.globalStorageService.setItem(STORAGE_KEYS.LAST_GROUP, newGroup);
    const groups: string[] =
      this.globalStorageService.getItem(STORAGE_KEYS.CONTENT_GROUPS) || [];
    if (groups) {
      for (let i = 0; i < groups.length; i++) {
        if (newGroup === groups[i]) {
          return false;
        }
      }
    }
    groups.push(newGroup);
    this.globalStorageService.setItem(STORAGE_KEYS.CONTENT_GROUPS, groups);
    return true;
  }

  updateGroupInMemoryStorage(oldName: string, newName: string) {
    const groups: string[] = this.globalStorageService.getItem(
      STORAGE_KEYS.CONTENT_GROUPS
    );
    if (groups) {
      for (let i = 0; i < groups.length; i++) {
        if (groups[i] === oldName) {
          groups[i] = newName;
          this.globalStorageService.setItem(STORAGE_KEYS.LAST_GROUP, groups[i]);
          break;
        }
      }
    } else {
      this.globalStorageService.setItem(STORAGE_KEYS.LAST_GROUP, newName);
    }
    this.globalStorageService.setItem(STORAGE_KEYS.CONTENT_GROUPS, groups);
  }

  sortContentGroupsByName(contentGroups: ContentGroup[]): ContentGroup[] {
    return contentGroups.sort((a, b) => a.name.localeCompare(b.name));
  }

  // import(
  //   roomId: string,
  //   groupId: string,
  //   blob: Blob
  // ): Observable<ImportResult> {
  //   const connectionUrl = this.buildUri(`/${groupId}/import`, roomId);
  //   const formData = new FormData();
  //   formData.append('file', blob);
  //   return this.http.post<ImportResult>(connectionUrl, formData).pipe(
  //     tap((r) => this.handleImportResult(r)),
  //     catchError(
  //       this.handleError<ImportResult>(
  //         'importContentGroup',
  //         undefined,
  //         'creator.content.import-failed'
  //       )
  //     )
  //   );
  // }

  // private handleImportResult(result: ImportResult) {
  //   if (result.importedLines >= result.totalLines) {
  //     return;
  //   }
  //   const message1 = this.translateService.translate(
  //     'creator.dialog.csv-import-errors',
  //     { importedLines: result.importedLines, totalLines: result.totalLines }
  //   );
  //   const message2 =
  //     result.importedLines > 0
  //       ? ' ' +
  //         this.translateService.translate(
  //           'creator.dialog.csv-import-errors-line-info',
  //           { errorLines: result.errorLines.join(', ') }
  //         )
  //       : '';
  //   this.dialog.open(BaseDialogComponent, {
  //     width: DIALOG_SIZES.small,
  //     data: {
  //       headerLabel: 'creator.dialog.csv-import-errors-header',
  //       body: message1 + message2,
  //       confirmLabel: 'dialog.close',
  //       type: 'button-primary',
  //     },
  //   });
  // }

  getQuestionnaireTypeIcons(): Map<QuestionnaireType, string> {
    return this.questionnaireTypeIcons;
  }

  /** In the order they are offered to users, which is not alphabetical. */
  getContentFormatsOfQuestionnaireType(
    questionnaireType: QuestionnaireType
  ): ContentType[] {
    switch (questionnaireType) {
      case QuestionnaireType.Mixed:
        return [
          ContentType.Choice,
          ContentType.Scale,
          ContentType.Binary,
          ContentType.Text,
          ContentType.ShortAnswer,
          ContentType.Wordcloud,
          ContentType.Sort,
          ContentType.Prioritization,
          ContentType.Numeric,
          ContentType.Flashcard,
          ContentType.Slide,
        ];
      case QuestionnaireType.Quiz:
        return [
          ContentType.Choice,
          ContentType.ShortAnswer,
          ContentType.Numeric,
          ContentType.Slide,
        ];
      case QuestionnaireType.Survey:
        return [
          ContentType.Choice,
          ContentType.Scale,
          ContentType.Text,
          ContentType.Wordcloud,
          ContentType.Numeric,
          ContentType.Slide,
        ];
      case QuestionnaireType.Flashcards:
        return [ContentType.Flashcard, ContentType.Slide];
      default:
        return [];
    }
  }

  isContentCompatibleWithQuestionnaireType(
    content: Content,
    questionnaireType: QuestionnaireType
  ): boolean {
    if (
      !this.getContentFormatsOfQuestionnaireType(questionnaireType).includes(
        content.formatData.format
      )
    ) {
      return false;
    }
    if (
      [ContentType.Flashcard, ContentType.Slide, ContentType.Text].includes(
        content.formatData.format
      ) ||
      questionnaireType === QuestionnaireType.Mixed
    ) {
      return true;
    }
    return (
      (content.hasCorrectAnswer &&
        questionnaireType === QuestionnaireType.Quiz) ||
      (!content.hasCorrectAnswer &&
        questionnaireType === QuestionnaireType.Survey)
    );
  }
}
