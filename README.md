Inspector "Clouseau"
=================
Inspector is a tool to search events in smart contracts

Installation
------------
To run the inspector, pull the repository from GitHub and install its dependencies. You will need [yarn](https://yarnpkg.com/lang/en/docs/install/) or [npm](https://docs.npmjs.com/cli/install) installed.

    git clone https://github.com/riflending/inspector
    cd inspector
    yarn install --lock-file # or `npm install`

Usage
------------
1. Copy the abi of smart contract inside the abi folder. *Important: name of file abi must be the same in config file*
2. Complete your config file.
* **HTTP_PROVIDER**: 
```javascript
export const HTTP_PROVIDER = "https://public-node.rsk.co";
```
* **gralConfig**: Is a general config for all search. In this defined the initial and the latest block to search.
```javascript
export const gralConfig = {
    iniBlock: 1504046,
    latestBlock: null //null = latest block in network
}
```
* **toSearch**: Are the smarts contracts to search, and the possibility to particular config

```javascript
export const toSearch = [
    {
        contractName: "cRBTC",//not required
        address: "0xc19f0882bf318c9f8767c7d520018888e878417b",
        abi: "cRBTC",
        events: ["AccrueInterest","Borrow"], //empty = all events
        iniBlock:1604000,
        iniBlock:1704000
    },
    {
        contractName: "crUSDT",//not required
        address: "0xfd09f3349fdab173d162cd0e4669b591ed5a78fb",
        abi: "cErc20",
        events: "",//empty = all events
        iniBlock: null, //default gralConfig
        latestBlock: null //default gralConfig
    },
    {
        address: "0xc19f0882bf318c9f8767c7d520018888e878417b",
        abi: "cRBTC"
    }
]
```
* **mongoDataClient**: is the config of mongo database
```javascript
export const mongoDataClient = {
    uri: "mongodb://127.0.0.1:27017/mongodb",
    db: "rLending",
    configCollection: "history",
    user: "",//TODO
    password: ""//TODO
}
```
3. Run `yarn start`

Mongo
------------
Inspector Clouseau, save your search in mongodb, your data is structured as follows:

### History Collection *(configCollection)*
In this collection, Clouseau, save your searches metadata.
This is an example of json:
```javascript

{
  "_id": "605b5eb66deb69082c0ec620",
  "address": "0xc19f0882bf318c9f8767c7d520018888e878417b",
  "name": "cRBTC",
  "history": [
    {
      "event": "AccrueInterest",
      "iniBlock": 1504046,
      "latestBlock": 1709924
    },
    {
      "event": "Borrow",
      "iniBlock": 1504046,
      "latestBlock": 1709924
    }
  ]
}
```
So if you try to search for data, then Clouseau searched, **it will be excluded.**

In the history, will find the events saved in other collections.

### SC Collection
Is the data searched of the SC, the name of collection is the address of SC.
This is a json example:
```javascript
{
  "_id": "605b5eb66deb69082c0ec61f",
  "contractName": "cRBTC",
  "address": "0xc19f0882bf318c9f8767c7d520018888e878417b",
  "abi": "cRBTC",
  "events": [
    {
      "blockNumber": 1677985,
      "event": "AccrueInterest",
      "signer": "AccrueInterest(uint256,uint256,uint256,uint256)",
      "args": {
        "cashPrior": {
          "_hex": "0x0d6507ba5d06a512",
          "_isBigNumber": true
        },
        "interestAccumulated": {
          "_hex": "0x975ed1d247",
          "_isBigNumber": true
        },
        "borrowIndex": {
          "_hex": "0x0e056f3848578378",
          "_isBigNumber": true
        },
        "totalBorrows": {
          "_hex": "0x01d2af6959343edf",
          "_isBigNumber": true
        }
      }
    },
    {
      "blockNumber": 1677986,
      "event": "AccrueInterest",
      "signer": "AccrueInterest(uint256,uint256,uint256,uint256)",
      "args": {
        "cashPrior": {
          "_hex": "0x0d6507ba5d06a512",
          "_isBigNumber": true
        },
        "interestAccumulated": {
          "_hex": "0x01a0adc1e6",
          "_isBigNumber": true
        },
        "borrowIndex": {
          "_hex": "0x0e056f44cd28dcad",
          "_isBigNumber": true
        },
        "totalBorrows": {
          "_hex": "0x01d2af6af9e200c5",
          "_isBigNumber": true
        }
      }
    },
    {
      "blockNumber": 1678003,
      "event": "AccrueInterest",
      "signer": "AccrueInterest(uint256,uint256,uint256,uint256)",
      "args": {
        "cashPrior": {
          "_hex": "0x0d6507ba5d06a512",
          "_isBigNumber": true
        },
        "interestAccumulated": {
          "_hex": "0x1bab8a075b",
          "_isBigNumber": true
        },
        "borrowIndex": {
          "_hex": "0x0e0570199f10f5a1",
          "_isBigNumber": true
        },
        "totalBorrows": {
          "_hex": "0x01d2af86a56c0820",
          "_isBigNumber": true
        }
      }
    },
    {
      "blockNumber": 1546922,
      "event": "Borrow",
      "signer": "Borrow(address,uint256,uint256,uint256)",
      "args": {
        "borrower": "0xE02e4796345b1b938F34342194C51A76A922aa1b",
        "borrowAmount": {
          "_hex": "0x5af3107a4000",
          "_isBigNumber": true
        },
        "accountBorrows": {
          "_hex": "0x5af3107a4000",
          "_isBigNumber": true
        },
        "totalBorrows": {
          "_hex": "0x5af31112da4c",
          "_isBigNumber": true
        }
      }
    },

    ...

    "filter": {
    "address": "0xc19f0882bf318c9f8767c7d520018888e878417b",
    "topics": [
      [
        "0x4dec04e750ca11537cabcd8a9eab06494de08da3735bc8871cd41250e190bc04",
        "0x13ed6866d4e1ee6da46f845c46d7e54120883d75c5ea9a2dacc1c4ca8984ab80"
      ]
    ]
  },
  "filterNames": [
    "AccrueInterest",
    "Borrow"
  ],
  "iniBlock": 1504046,
  "latestBlock": 1709924,
}
```

Prerequisites
------------
To make sure that mongo it's ok, please run test
    
    yarn testMongo

