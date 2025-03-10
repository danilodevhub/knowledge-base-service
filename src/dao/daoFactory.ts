import { IDao } from './IDao';
import { JsonFileDao } from './jsonFileDao';

export class DaoFactory {
  static createJsonFileDao<T extends { id: string }>(fileName: string): IDao<T> {
    return new JsonFileDao<T>(fileName);
  }
}
