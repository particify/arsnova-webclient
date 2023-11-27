import { TemplateTag } from '@app/core/models/template-tag';

export class ContentGroupTemplate {
  id: string;
  name: string;
  description: string;
  language: string;
  tags: TemplateTag[];
  license: string;
  aiGenerated: boolean;
  attribution?: string;
  templateIds: string[];
  creatorId: string;
  revision: string;

  constructor(
    name: string,
    description: string,
    language: string,
    tags: TemplateTag[],
    license: string,
    aiGenerated = false,
    attribution?: string,
    templateIds?: string[]
  ) {
    this.name = name;
    this.description = description;
    this.language = language;
    this.tags = tags;
    this.license = license;
    this.aiGenerated = aiGenerated;
    this.attribution = attribution;
    if (templateIds) {
      this.templateIds = templateIds;
    }
  }
}
