export enum StorageItemCategory {
  UNSPECIFIED,
  REQUIRED,
  FUNCTIONAL,
  STATISTICS,
  MARKETING
}

export enum StorageBackend {
  MEMORY,
  SESSIONSTORAGE,
  LOCALSTORAGE,
  COOKIE
}

export interface StorageItem {
  key: symbol;
  name: string;
  prefix?: string;
  category: StorageItemCategory;
  backend: StorageBackend;
}
