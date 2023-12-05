import { LanguageCategory } from '@app/core/models/language-category.enum';

// TODO: non-null assertion operator is used here temporaly. We need to find good structure for our models.
export class Language {
  key!: string;
  name!: string;
  category!: LanguageCategory;
}
