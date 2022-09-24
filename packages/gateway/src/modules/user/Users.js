import { RESTDataSource } from 'apollo-datasource-rest';

import { config } from '../../config/config';

const { REST_ENDPOINT } = config;

export class Users extends RESTDataSource {
  constructor() {
    super();

    this.baseURL = REST_ENDPOINT;
  }

  async getUser() {
    return this.get('me');
  }
}
