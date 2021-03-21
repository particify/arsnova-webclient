import { UpdateImportance } from '../version-info';

export class UpdateInstalled {
  type: string;
  payload: {
    newId: string;
    newHash: string;
    oldId: string;
    oldHash: string;
    importance: UpdateImportance;
    loadTime: number;
  };

  constructor(newId: string, newHash: string, oldId: string, oldHash: string, importance: UpdateImportance, loadTime: number) {
    this.type = 'UpdateInstalled';
    this.payload = {
      newId: newId,
      newHash: newHash,
      oldId: oldId,
      oldHash: oldHash,
      importance: importance,
      loadTime: loadTime
    };
  }
}
