const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    this.db = null;
    const host = process.env.DB_HOST || '127.0.0.1';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}`;

    MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
      if (err) throw (err);
      this.db = client.db(database);
      this.db.createCollection('users');
      this.db.createCollection('files');
    });
  }

  isAlive() {
    return !!this.db;
  }

  async nbUsers() {
    const numUsers = await this.db.collection('users').countDocuments();
    return numUsers;
  }

  async nbFiles() {
    const numFiles = await this.db.collection('files').countDocuments();
    return numFiles;
  }
}

const dbClient = new DBClient();
export default dbClient;
