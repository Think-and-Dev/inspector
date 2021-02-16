const FactoryContract = require("./factoryContract");
const BigNumber = require("bignumber.js");
const { ethers } = require("ethers");
const { abi, cRBTCTokenDetails, constants } = require("./constants");

BigNumber.set({ EXPONENTIAL_AT: [-18, 36] });

process.env.VUE_APP_HTTP_PROVIDER = "http://18.218.165.234:4444";

class Middleware {
  constructor() {
    this.factoryContract = new FactoryContract();
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
          let auxiliar = logs.map(function (element) {
            const iface = new ethers.utils.Interface(abiCtoken);
            return iface.parseLog(element).args[0];
          });
          auxiliar = auxiliar.filter((v, i, a) => a.indexOf(v) === i);

          for (let index = 0; index < auxiliar.length; index++) {
            borrows.push(auxiliar[index]);
          }
        }
      } catch (error) {
        console.error("ERROR", error);
      }
    }
    borrows = borrows.filter((v, i, a) => a.indexOf(v) === i);
    return borrows;
  }

  async getAccountUnderwater() {
    const borrowAccounts = await this.borrowAccounts();
    let underWaters = [];

    for (let index = 0; index < borrowAccounts.length; index++) {
      await this.getAccountLiquidity(borrowAccounts[index]).then(
        (liquidity) => {
          if (new BigNumber(liquidity.accountShortfall._hex).isGreaterThan(0)) {
            underWaters.push(borrowAccounts[index]);
          }
        }
      );
    }
    return underWaters;
  }

  async getAccountLiquidity(account) {
    const contract = this.factoryContract.getContractByNameAndAbiName(
      constants.Unitroller,
      constants.Comptroller
    );
    const [
      err,
      accountLiquidityInExcess,
      accountShortfall,
    ] = await contract.getAccountLiquidity(account);
    return {
      err,
      accountLiquidityInExcess,
      accountShortfall,
    };
  }
}

module.exports = Middleware;
