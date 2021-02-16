const { Comptroller } = require('../abis/comptroller')
const { CERC20 } = require('../abis/cErc20')
const { CRBTC } = require('../abis/cRBTC')

const abi = {
  Comptroller: Comptroller,
  cRBTC: CRBTC,
  cErc20: CERC20
}

const constants = {
  Unitroller: 'Unitroller',
  Comptroller: 'Comptroller',
  cRBTC: 'cRBTC',
  RBTC: 'RBTC',
}

const decimals = {
  RBTC: 18,
  cRBTC: 8,
}

const cRBTCTokenDetails = {
  symbol: 'cRBTC',
  name: 'ctoken rbtc',
  decimals: decimals.cRBTC,
  underlying: { symbol: 'RBTC', name: 'RSK Smart Bitcoin', decimals: decimals.RBTC },
  logo: 'rbtc',
  //this is use to substract the calculate liquidated amount (closed Factor * borrow borrower), because this calculate have a insignificant (but precius) % of  lost
  liquidate: {
    sub: 0.000001,
    decimalToFix: 8,
  },
}

const addresses = {
  31: {
    cRBTC: '0xc19f0882bf318c9f8767c7d520018888e878417b',
    Unitroller: '0x3a983c7597b3ac4fbc3e0cf484d7631d70d04c05',
    Comptroller: '0x2e64b3acd75d86a8ff17b98e02dae4dcf2852a94',
  }
}


module.exports = {
  abi, constants, cRBTCTokenDetails, addresses
}