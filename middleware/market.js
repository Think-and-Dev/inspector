const { ethers } = require("ethers");
const BigNumber = require("bignumber.js");
const { abi, cRBTCTokenDetails } = require("./constants");
const FactoryContract = require("./factoryContract");

BigNumber.set({ EXPONENTIAL_AT: [-18, 36] });

process.env.VUE_APP_HTTP_PROVIDER = "http://18.218.165.234:4444";

class Market {
  constructor(middleware) {
    this.factoryContract = new FactoryContract();
    this.middleware = middleware;
    this.instance = this.factoryContract.getContractCtoken(
      cRBTCTokenDetails.symbol
    );
  }

  async borrowAccounts() {
    let borrows = [];

    if (!process.env.VUE_APP_HTTP_PROVIDER) return borrows;
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.VUE_APP_HTTP_PROVIDER
    );

    const abiCtoken = this.isCRBTC ? abi["cRBTC"] : abi["cErc20"];
    const filterLocal = this.instance.filters.Borrow();
    const latest = await provider.getBlockNumber();
    const ini = 1504046;
    for (let index = latest; index > ini; index -= 1000) {
      try {
        let logs = await provider.getLogs({
          ...filterLocal,
          fromBlock: index - 1000,
          toBlock: index,
        });
        if (logs.length > 0) {
          console.log(logs);
          let auxiliar = logs.map(function (element) {
            const iface = new ethers.utils.Interface(abiCtoken);
            //return first element of event (borrower)
            //TODO fix "args[0]"
            return iface.parseLog(element).args[0];
          });
          //get distinct address
          auxiliar = auxiliar.filter((v, i, a) => a.indexOf(v) === i);

          for (let index = 0; index < auxiliar.length; index++) {
            borrows.push(auxiliar[index]);
          }
        }
      } catch (error) {
        console.error("ERROR", error);
      }
    }
    //TODO see if apply distinct once
    //get distinct address
    borrows = borrows.filter((v, i, a) => a.indexOf(v) === i);
    return borrows;
  }

  async getAccountUnderwater() {
    const borrowAcconts = await this.borrowAccounts();
    let underWaters = [];
    for (let index = 0; index < borrowAcconts.length; index++) {
      await this.middleware
        .getAccountLiquidity(borrowAcconts[index])
        .then((liquidity) => {
          if (new BigNumber(liquidity.accountShortfall._hex).isGreaterThan(0)) {
            underWaters.push(borrowAcconts[index]);
          }
        });
    }
    return underWaters;
  }
}

module.exports = Market;
