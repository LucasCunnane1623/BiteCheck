import {MongoClient} from 'mongodb';
import {mongoConfig} from './mongoSettings.js';


//THIS SYSTEM OF GETTING THE MONGO DB IS ONLY USED FOR SEEDING THE DATABASE, ALL OTHER FILES SHOULD USE THE GETDB FUNCTION IN THE DB.JS FILE TO GET THE DATABASE CONNECTION.
let _connection = undefined;
let _db = undefined;

export const dbConnection = async () => {
  if (!_connection) {
    _connection = await MongoClient.connect(mongoConfig.serverUrl);
    _db = _connection.db(mongoConfig.database);
  }

  return _db;
};
export const closeConnection = async () => {
  await _connection.close();
};
