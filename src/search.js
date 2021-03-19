import { toSearch, HTTP_PROVIDER, gralConfig, abi } from '../config/config.js'
import Mongo from './mongo.js'
import { ethers } from 'ethers'

export default class Search {

    constructor() {
        this.provider = new ethers.providers.JsonRpcProvider(HTTP_PROVIDER)
        this.perBlocks = 1000
        this.instanceMongo = new Mongo()
    }

    getDataToSearh() {
        if (!toSearch) {
            console.error("there is no data to search!!")
            return
        }
        return toSearch
    }

    async getGralConfig() {
        if (!gralConfig) {
            console.error("gral config is not set!!")
            return
        }
        return { ini: gralConfig.iniBlock, latest: (!gralConfig.latestBlock) ? await this.provider.getBlockNumber() : gralConfig.latestBlock }
    }

    getAbi(abiName) {
        if (Object.prototype.hasOwnProperty.call(abi, abiName)) return abi[abiName]
        console.error(abiName, " abi not exit")
        return
    }

    getFilters(objAbi) {
        let retorno = []
        for (let i = 0; i < objAbi.length; i++) {
            if ((!!objAbi[i].type) && (objAbi[i].type === 'event')) {
                retorno.push(objAbi[i].name)
            }
        }
        return retorno
    }

    async searchEvents() {
        let found = []
        const search = this.getDataToSearh()
        const { ini, latest } = await this.getGralConfig()

        let filter, iniBlock, latestBlock
        for (const key in search) {
            try {
                //get obj abi
                const objAbi = this.getAbi(search[key].abi)
                // console.log("FILTROS", this.getFilters(objAbi))
                //get all events => filters
                const filtersAbi = this.getFilters(objAbi)
                //get contract
                const contract = new ethers.Contract(search[key].address, this.getAbi(search[key].abi), this.provider)

                //get all topics of events
                const topics = filtersAbi.map(x => contract.filters[x]().topics[0])
                //ini filter to search
                filter = contract.filters[filtersAbi[0]]()
                //add all topics (events), added in array to use OR between events
                filter.topics = [topics]
                //set ini block
                iniBlock = (!search[key].iniBlock) ? ini : search[key].iniBlock
                //set last block
                latestBlock = (!search[key].latestBlock) ? latest : search[key].latestBlock

                let foundDetail = search[key]
                foundDetail.filter = filter
                foundDetail.filterNames = filtersAbi

                foundDetail.iniBlock = iniBlock
                foundDetail.latestBlock = latestBlock
                console.log("searching: ", foundDetail,"\n")
                //add return of searching in array 
                //TODO could be a promise and then executed all
                foundDetail.events = await this.searching(this.getAbi(search[key].abi), filter, iniBlock, latestBlock)
                found.push(foundDetail)
                console.log("save events for ", foundDetail.contractName, "=>", foundDetail.address, "\n"),
                //TODO see if insert when "searchEvents" finished
                this.instanceMongo.insertMany([foundDetail])
                // console.log(foundDetail)
            } catch (error) {
                console.error(error)
                return
            }
        }
        return found
    }

    async searching(objAbi, filter, ini, latest) {
        let retorno = []
        //search from perBlocks
        for (let index = latest; index > ini; index -= this.perBlocks) {
            try {
                //query to network
                let logs = await this.provider.getLogs({
                    ...filter,
                    fromBlock: index - this.perBlocks,
                    toBlock: index,
                })
                //validate filter result
                if (logs.length > 0) {
                    //get args of event logs
                    let auxiliar = logs.map(function (element) {
                        //set intrafece of abi
                        const iface = new ethers.utils.Interface(objAbi)
                        //get key of array (index and atr)
                        const keys = Object.keys(iface.parseLog(element).args)
                        //get only atr
                        const attributes = keys.slice(keys.length / 2)
                        //TODO map and then flat (?)
                        // const objArgs = attributes.map(x => ({ [x]: iface.parseLog(element).args[x] }))
                        //OR
                        //map all atr with theirs values in one obj
                        let objArgs = {}
                        for (const key in attributes) {
                            const argName = attributes[key];
                            objArgs[argName] = iface.parseLog(element).args[argName]
                        }
                        return { blockNumber: element.blockNumber, event: iface.parseLog(element).name, signer: iface.parseLog(element).signature, args: objArgs }
                    })
                    // TODO see if flat is a for
                    // for (let i = 0; i < auxiliar.length; i++) {
                    //     retorno.push(auxiliar[i])
                    // }
                    //OR
                    retorno.push(auxiliar)
                    retorno = retorno.flat()
                    return retorno
                }
            } catch (error) {
                console.error('ERROR to find logs', error)
            }
        }
        return retorno
    }




}