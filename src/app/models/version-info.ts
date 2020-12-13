export interface VersionInfo {
  id: string;
  changes: { [lang: string]: string[] };
  importance: UpdateImportance;
}

export enum UpdateImportance {
  OPTIONAL = 'OPTIONAL',
  RECOMMENDED = 'RECOMMENDED',
  MANDATORY = 'MANDATORY'
}
