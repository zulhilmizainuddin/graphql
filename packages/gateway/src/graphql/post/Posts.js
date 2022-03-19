import { MongoDataSource } from 'apollo-datasource-mongodb';

export class Posts extends MongoDataSource {
  async getPosts() {
    return this.collection.find({}).toArray();
  }

  async getPostsByAuthorId(authorId) {
    return this.findByFields({ authorId });
  }

  async getUpdatedPostById(id) {
    const { value } = await this.collection.findOneAndUpdate({
      id,
    }, {
      $inc: { votes: 1 },
    }, {
      returnDocument: 'after',
    });

    return value;
  }
}
