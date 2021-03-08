export class PatchComment {
  type: string;
  payload: {
    id: string;
    changes: { [key: string ]: object };
  };

  constructor(id: string, changes: { [key: string ]: object }) {
    this.type = 'PatchComment';
    this.payload = {
      id: id,
      changes: changes
    };
  }
}
