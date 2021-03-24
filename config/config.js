import { CERC20 } from '../abis/cErc20.js'
import { Comptroller } from '../abis/comptroller.js'
import { CRBTC } from '../abis/cRBTC.js'

export const abi = {
    cErc20: CERC20,
    Comptroller: Comptroller,
    cRBTC: CRBTC,
}

export const HTTP_PROVIDER = "http://18.218.165.234:4444";

export const gralConfig = {
    iniBlock: 1504046,
    latestBlock: null //null = latest block in network
}
export const toSearch = [
    {
        contractName: "cRBTC",//not required
        address: "0xc19f0882bf318c9f8767c7d520018888e878417b",
        abi: "cRBTC",
        events: ["AccrueInterest","Borrow"], //empty = all events
    },
    {
        contractName: "crUSDT",//not required
        address: "0xfd09f3349fdab173d162cd0e4669b591ed5a78fb",
        abi: "cErc20",
        events: "",//empty = all events
        iniBlock: null, //default gralConfig
        latestBlock: null //default gral Config
    },
    {
        contractName: "",//not required
        address: "0xc19f0882bf318c9f8767c7d520018888e878417b",
        abi: "cRBTC",
        events: ["AccrueInterest",] //empty = all events
    },
    {
        address: "0xc19f0882bf318c9f8767c7d520018888e878417b",
        abi: "cRBTC",
    },
]

export const mongoDataClient = {
    uri: "mongodb://127.0.0.1:27017/mongodb",
    db: "rLending",
    configCollection: "history",
    user: "",//TODO
    password: ""//TODO
}