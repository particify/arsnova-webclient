import { TemplateTag } from '@app/core/models/template-tag';

export class ContentGroupTemplate {
  id: string;
  name: string;
  description: string;
  language: string;
  tags: TemplateTag[];
  license: string;
  templateIds: string[];

  constructor(
    name: string,
    description: string,
    language: string,
    tags: TemplateTag[],
    license: string,
    templateIds?: string[]
  ) {
    this.name = name;
    this.description = description;
    this.language = language;
    this.tags = tags;
    this.license = license;
    if (templateIds) {
      this.templateIds = templateIds;
    }
  }
}
