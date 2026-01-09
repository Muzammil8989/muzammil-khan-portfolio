// lib/mongodb.ts
import { MongoClient, Db } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

if (!process.env.MONGODB_DB) {
  throw new Error("Please define the MONGODB_DB environment variable");
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise!;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export { clientPromise };

export default clientPromise;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  const connectedClient = await clientPromise;
  const db = connectedClient.db(dbName);
  return { client: connectedClient, db };
}
