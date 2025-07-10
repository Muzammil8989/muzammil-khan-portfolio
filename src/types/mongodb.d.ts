import { Db, Collection } from "mongodb";

declare global {
  interface MongoCollections {
    cl_users?: Collection;
    cl_about?: Collection;
    cl_intros?: Collection;
  }

  var _mongoClientPromise: Promise<MongoClient>;
}
