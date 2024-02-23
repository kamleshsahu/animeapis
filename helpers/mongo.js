import { MongoClient } from 'mongodb';
export let mongoClient;

async function init() {
 /**
  * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
  * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
  */
 const uri = process.env.MONGO;

 console.log("Mongo URI:", uri);
 const client = new MongoClient(uri);

 try {
  // Connect to the MongoDB cluster
  await client.connect();

  const db = client;

  return db;

 } catch (e) {
  console.error(e);
 }
}

export const getMongoClient = async () => {
 if (!mongoClient) {
  mongoClient = await init();
 }
 return mongoClient;
};

export const closeConnection = async () => {
 if (mongoClient) {
  await mongoClient.close();
 }
};


async function listDatabases(client) {
 const databasesList = await client.db().admin().listDatabases();

 console.log('Databases:');
 databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};


// main().catch(console.error);
