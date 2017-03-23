import * as Loki from 'lokijs';

export abstract class DataManager<T> {
  protected collection;

  constructor(protected data: Loki, collectionName: string) {
    this.collection = data.getCollection<T>(collectionName);

    if(this.collection == null) {
      this.collection = this.createCollection(collectionName);
    }
  }

  protected abstract createCollection(collectionName: string);
}
