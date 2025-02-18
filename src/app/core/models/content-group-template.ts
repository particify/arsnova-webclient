import { GroupType } from '@app/core/models/content-group';
import { TemplateTag } from '@app/core/models/template-tag';

// TODO: non-null assertion operator is used here temporaly. We need to find good structure for our models.
export class ContentGroupTemplate {
  id!: string;
  templateIds: string[] = [];
  name: string;
  published: boolean;
  language: string;
  description: string;
  tags: TemplateTag[];
  license?: string;
  groupType!: GroupType;
  aiGenerated: boolean;
  attribution?: string;
  creatorId!: string;
  revision!: string;

  constructor(
    name: string,
    description: string,
    language: string,
    published: boolean,
    tags: TemplateTag[] = [],
    license?: string,
    aiGenerated = false,
    attribution?: string,
    templateIds?: string[]
  ) {
    this.name = name;
    this.published = published;
    this.language = language;
    this.description = description;
    this.tags = tags;
    this.license = license;
    this.aiGenerated = aiGenerated;
    this.attribution = attribution;
    if (templateIds) {
      this.templateIds = templateIds;
    }
  }
}
