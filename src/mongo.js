import MongoPkg from "mongodb"
const { MongoClient } = MongoPkg;
import { mongoDataClient } from '../config/config.js'

export default class Mongo {
    constructor() {
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
    }

    async insertMany(docs, collection) {
        // this option prevents additional documents from being inserted if one fails
        const options = { ordered: true };
        try {
            await this.connect()
            this.collection = this.db.collection(collection)
            const result = await this.collection.insertMany(docs, options);
        } catch (error) {
            console.error(error)
        } finally {
            this.client.close()

        }
    }
    async insertOne(doc, collection) {
        try {
            await this.connect()
            const collection = this.db.collection(mongoDataClient.configCollection)
            const result = await collection.insertOne(doc);
        } catch (error) {
            console.error(error)
        } finally {
            this.client.close()
        }
    }


    async getCollectionNameForSC(addressSC) {
        const collection = await this.findSmartContractMetaData(addressSC)
        return (!collection) ? null : collection.collectionName
    }

    async findSmartContractMetaData(addressSC) {
        try {
            await this.connect()
            const dataJson = await this.db.collection(mongoDataClient.configCollection).findOne({
                address: addressSC
            });
            return dataJson
        } catch (error) {
            console.error(error)
        } finally {
            this.client.close()
        }
    }

    async setConfigSC(configSC) {
        return this.insertOne(configSC, mongoDataClient.configCollection)
    }

    async updateConfiSC(addressSC, historyObj) {
        try {
            await this.connect()
            await this.db.collection(mongoDataClient.configCollection).updateOne(
                { address: addressSC },
                { $set: { history: historyObj } })
        } catch (error) {
            console.error(error)
        } finally {
            this.client.close()
        }

    }

}