import MongoPkg from "mongodb"
const {MongoClient} = MongoPkg; 
import { mongoDataClient } from '../config/config.js'

 export default class Mongo {
    constructor() {
        //TODO
        // this.client = new MongoClient(mongoDataClient.uri, {
        //     useNewUrlParser: true,
        //     useUnifiedTopology: true,
        // });
        this.client = null
        this.db = null
        this.collection = null
    }
    

    async connect() {
        this.client = new MongoClient(mongoDataClient.uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        await this.client.connect()
        this.db = this.client.db(mongoDataClient.db)
        this.collection = this.db.collection(mongoDataClient.collection)
    }

    async insertMany(docs) {
        // this option prevents additional documents from being inserted if one fails
        const options = { ordered: true };
        try {
            await this.connect()
            const result = await this.collection.insertMany(docs, options);
        } catch (error) {
            console.error(error)
        } finally {
            this.client.close()

        }
    }

}