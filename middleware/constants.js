const { Comptroller } = require("../abis/comptroller");
const { CERC20 } = require("../abis/cErc20");
const { CRBTC } = require("../abis/cRBTC");
const { PriceOracleProxy } = require("../abis/priceOracleProxy");

const abi = {
  Comptroller: Comptroller,
  cRBTC: CRBTC,
  cErc20: CERC20,
  PriceOracleProxy: PriceOracleProxy,
};

const constants = {
  Unitroller: "Unitroller",
  Comptroller: "Comptroller",
  cRBTC: "cRBTC",
  RBTC: "RBTC",
  crUSDT: "crUSDT",
  cRIF: "cRIF",
};

const decimals = {
  RBTC: 18,
  cRBTC: 8,
  RIF: 18,
  cRIF: 8,
  RLEN: 18,
  crUSDT: 8,
  rUSDT: 18,
};

const cTokensDetails = [
  {
    symbol: "crUSDT",
    name: "cToken rLending USDT",
    decimals: decimals.crUSDT,
    underlying: {
      symbol: "rUSDT",
      name: "Tether USD",
      decimals: decimals.rUSDT,
    },
    logo: "usdt",
    adapter: "PriceOracleAdapterUSDT",
    //this is use to substract the calculate liquidated amount (closed Factor * borrow borrower), because this calculate have a insignificant (but precius) % of  lost
    liquidate: {
      sub: 0.0001,
      decimalToFix: 6,
    },
  },
  {
    symbol: "cRIF",
    name: "cToken rLending Rif",
    decimals: decimals.cRIF,
    underlying: {
      symbol: "RIF",
      name: "RSK Infrastructure Token",
      decimals: decimals.RIF,
    },
    logo: "rif",
    adapter: "PriceOracleAdapterRif",
    //this is use to substract the calculate liquidated amount (closed Factor * borrow borrower), because this calculate have a insignificant (but precius) % of  lost
    liquidate: {
      sub: 0.001,
      decimalToFix: 6,
    },
  },
  {
    symbol: "cRBTC",
    name: "ctoken rbtc",
    decimals: decimals.cRBTC,
    underlying: {
      symbol: "RBTC",
      name: "RSK Smart Bitcoin",
      decimals: decimals.RBTC,
    },
    logo: "rbtc",
    adapter: "PriceOracleAdapterRBTC",
    //this is use to substract the calculate liquidated amount (closed Factor * borrow borrower), because this calculate have a insignificant (but precius) % of  lost
    liquidate: {
      sub: 0.000001,
      decimalToFix: 8,
    },
  },
];

const addresses = {
  31: {
    Unitroller: "0x3a983c7597b3ac4fbc3e0cf484d7631d70d04c05",
    Comptroller: "0x2e64b3acd75d86a8ff17b98e02dae4dcf2852a94",
    cRBTC: "0xc19f0882bf318c9f8767c7d520018888e878417b",
    crUSDT: "0xfd09f3349fdab173d162cd0e4669b591ed5a78fb",
    cRIF: "0x4664d4cbd5104a0e974354724cbc8e0d9bd1aca3",
    RIF: "0x19f64674d8a5b4e652319f5e239efd3bc969a1fe",
    rUSDT: "0x4cfe225ce54c6609a525768b13f7d87432358c57",
    PriceOracleProxy: "0xbe898c9fc63c0185bc6e403e7b9c12e341a60aa7",
  },
};

module.exports = {
  abi,
  constants,
  cTokensDetails,
  addresses,
  decimals,
};
