const { CERC20 } = require('../abis/cErc20')
const { CRBTC } = require('../abis/cRBTC')

const abi = {
  cRBTC: CRBTC,
  cErc20: CERC20
}

const constants = {
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
    cRBTC: '0xc19f0882bf318c9f8767c7d520018888e878417b'
  }
}


module.exports = {
  abi, constants, cRBTCTokenDetails, addresses
}