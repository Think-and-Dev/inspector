const FactoryContract = require("./factoryContract");
const TestMongo = require("../TestMongo");
const BigNumber = require("bignumber.js");
const { ethers } = require("ethers");
const { abi, cRBTCTokenDetails, constants } = require("./constants");

BigNumber.set({ EXPONENTIAL_AT: [-18, 36] });

process.env.VUE_APP_HTTP_PROVIDER = "http://18.218.165.234:4444";

class Middleware {
  constructor() {
    this.factoryContract = new FactoryContract();
    this.contractInstance = this.factoryContract.getContractCtoken(
      cRBTCTokenDetails.symbol
    );
    this.mongoInstance = new TestMongo();
  }

  async borrowAccounts() {
    let borrows = [];

    if (!process.env.VUE_APP_HTTP_PROVIDER) return borrows;
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.VUE_APP_HTTP_PROVIDER
    );

    const abiCtoken = this.isCRBTC ? abi["cRBTC"] : abi["cErc20"];
    const filterLocal = this.contractInstance.filters.Borrow();
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
            const { borrowAmount } = iface.parseLog(element).args;
            return {
              address: iface.parseLog(element).args[0],
              borrowAmount: new BigNumber((borrowAmount._hex).toString()).div(1e18).toString(),
            };
          });
          auxiliar = [
            ...new Map(auxiliar.map((acc) => [acc.address, acc])).values(),
          ];

          for (let index = 0; index < auxiliar.length; index++) {
            borrows.push(auxiliar[index]);
          }
        }
      } catch (error) {
        console.error("ERROR", error);
      }
    }
    borrows = [...new Map(borrows.map((acc) => [acc.address, acc])).values()];
    return borrows;
  }

  async getAccountUnderwater() {
    const borrowAccounts = await this.borrowAccounts();

    for (let index = 0; index < borrowAccounts.length; index++) {
      await this.getAccountLiquidity(borrowAccounts[index].address).then(
        (liquidity) => {
          const actualIsRed =
            new BigNumber(liquidity.accountShortfall._hex).isGreaterThan(0) ===
            true
              ? true
              : false;
          this.mongoInstance.saveAndFlush({
            address: borrowAccounts[index].address,
            isRed: actualIsRed,
            borrowAmount: borrowAccounts[index].borrowAmount
          });
        }
      );
    }
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
