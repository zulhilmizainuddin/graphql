import { RESTDataSource } from 'apollo-datasource-rest';

export class Users extends RESTDataSource {
  constructor() {
    super();

    this.baseURL = 'http://localhost:4002/';
  }

  async getUser() {
    return this.get('me');
  }
}
