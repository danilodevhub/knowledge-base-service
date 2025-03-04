export interface IDao<T> {
  findAll(): T[];
  findById(id: string): T | null;
  findBy(predicate: (item: T) => boolean): T | null;
  findManyBy(predicate: (item: T) => boolean): T[];
  create(item: T): void;
  update(predicate: (item: T) => boolean, item: T): void;
  delete(predicate: (item: T) => boolean): void;
}
