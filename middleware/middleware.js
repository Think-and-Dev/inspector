const FactoryContract = require("./factoryContract");
const Mongo = require("../Mongo");
const BigNumber = require("bignumber.js");
const { ethers } = require("ethers");
const { abi, cTokensDetails, constants } = require("./constants");

BigNumber.set({ EXPONENTIAL_AT: [-18, 36] });

process.env.VUE_APP_HTTP_PROVIDER = "http://18.218.165.234:4444";

class Middleware {
  constructor() {
    this.factoryContract = new FactoryContract();
    this.mongoInstance = new Mongo();
  }

  async borrowAccountsByMarket(isCRBTC, contractInstance, contractSymbol) {
    let borrows = [];

    if (!process.env.VUE_APP_HTTP_PROVIDER) return borrows;
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.VUE_APP_HTTP_PROVIDER
    );

    const abiCtoken = isCRBTC ? abi["cRBTC"] : abi["cErc20"];
    const filterLocal = contractInstance.filters.Borrow();
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
              borrowAmount: new BigNumber(borrowAmount._hex.toString())
                .div(1e18)
                .toString(),
              marketBorrowed: contractSymbol,
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
    let allMarketBorrowAccounts = [];
    
    //iterate all market by one and push the elements
    for (let i = 0; i < cTokensDetails.length; i++) {
      const borrowAccountsByMarket = await this.borrowAccountsByMarket(
        cTokensDetails[i].symbol === "cRBTC",
        this.factoryContract.getContractCtoken(cTokensDetails[i].symbol),
        cTokensDetails[i].symbol
      );
      allMarketBorrowAccounts.push(...borrowAccountsByMarket);
    }

    // create connection to db
    await this.mongoInstance.createConnection();
    for (let index = 0; index < allMarketBorrowAccounts.length; index++) {
      await this.getAccountLiquidity(
        allMarketBorrowAccounts[index].address
      ).then((liquidity) => {
        const actualIsRed =
          new BigNumber(liquidity.accountShortfall._hex).isGreaterThan(0) ===
          true
            ? true
            : false;
        this.mongoInstance.saveAndFlush({
          address: allMarketBorrowAccounts[index].address,
          isRed: actualIsRed,
          borrowAmount: allMarketBorrowAccounts[index].borrowAmount,
          marketBorrowed: allMarketBorrowAccounts[index].marketBorrowed,
        });
      });
    }
    // close connection to db
    await this.mongoInstance.closeConnection();
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
