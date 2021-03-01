const Mongo = require("../Mongo");
const BigNumber = require("bignumber.js");
const { ethers } = require("ethers");
const { abi, cTokensDetails, constants, addresses } = require("./constants");
const {
  HTTP_PROVIDER,
  INITIAL_BLOCK,
  CRBTC_SYMBOL,
  NETWORK_ID,
  PRIVATE_KEY_WALLET,
  COLLATERAL_TO_USE,
} = require("../config/constants");

BigNumber.set({ EXPONENTIAL_AT: [-18, 36] });

class Middleware {
  constructor() {
    this.mongoInstance = new Mongo();
    this.provider = new ethers.providers.JsonRpcProvider(HTTP_PROVIDER);
    this.addressesContract = addresses[NETWORK_ID];
    this.contractInstances = this.generateContractInstances();
    this.wallet = new ethers.Wallet(PRIVATE_KEY_WALLET, this.provider);
  }

  /*
  CONTRACT LOGIC
  */

  getContractCtoken(name) {
    const abiCtoken = name == "cRBTC" ? abi.cRBTC : abi.cErc20;
    return new ethers.Contract(
      this.addressesContract[name],
      abiCtoken,
      this.provider
    );
  }

  getDefaultSigner() {
    const format = this.provider.formatter.formats;
    const signer = this.provider.getSigner();
    Object.assign(signer.provider.formatter, { format });
    return signer;
  }

  getContractByNameAndAbiName(nameContract, nameAbi) {
    return new ethers.Contract(
      this.addressesContract[nameContract],
      abi[nameAbi],
      this.provider
    );
  }

  generateContractInstances() {
    let contractInstances = new Map();
    for (let i = 0; i < cTokensDetails.length; i++) {
      const contractInstance = this.getContractCtoken(cTokensDetails[i].symbol);
      contractInstances.set(cTokensDetails[i].symbol, contractInstance);
      // generate log here
    }
    return contractInstances;
  }

  async borrowAccountsByMarket(isCRBTC, contractInstance, contractSymbol) {
    let borrows = [];

    if (!HTTP_PROVIDER) return borrows;

    const abiCtoken = isCRBTC ? abi["cRBTC"] : abi["cErc20"];
    const filterLocal = contractInstance.filters.Borrow();
    const latest = await this.provider.getBlockNumber();

    for (let index = latest; index > INITIAL_BLOCK; index -= 1000) {
      try {
        let logs = await this.provider.getLogs({
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
              borrowAmount: new BigNumber(borrowAmount.toString())
                .div(1e18)
                .toString(),
              borrowMarket: contractSymbol,
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
        cTokensDetails[i].symbol === CRBTC_SYMBOL,
        this.contractInstances.get(cTokensDetails[i].symbol),
        cTokensDetails[i].symbol
      );
      allMarketBorrowAccounts.push(...borrowAccountsByMarket);
    }

    // create connection to db
    await this.mongoInstance.createConnection();
    for (let index = 0; index < allMarketBorrowAccounts.length; index++) {
      const liquidity = await this.getAccountLiquidity(
        allMarketBorrowAccounts[index].address
      );

      const accountShortfall = new BigNumber(
        liquidity.accountShortfall.toString()
      );

      await this.mongoInstance.saveAndFlush({
        address: allMarketBorrowAccounts[index].address,
        shortfall: accountShortfall.isGreaterThan(0)
          ? accountShortfall.toString()
          : 0,
        borrowAmount: allMarketBorrowAccounts[index].borrowAmount,
        borrowMarket: allMarketBorrowAccounts[index].borrowMarket,
      });
    }
    // close connection to db
    await this.mongoInstance.closeConnection();
  }

  async getAccountLiquidity(account) {
    const contract = this.getContractByNameAndAbiName(
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

  /*
  async liquidateBorrowAllowed(
    liquidateAccountAddress,
    liquidatorAccountAddress,
    amount,
    addressLiquidateMarket,
    addressCollateralMarket
  ) {
    //parse amount
    const decimal = 18;
    let amountBN = ethers.utils.parseUnits(amount.toFixed(decimal), decimal);
    //get contract and signer
    const contract = this.getContractByNameAndAbiName(
      constants.Unitroller,
      constants.Comptroller
    );
    const signer = contract.connect(this.getDefaultSigner());
    //call liquidateBorrowAllowed
    return await signer.callStatic.liquidateBorrowAllowed(
      addressLiquidateMarket,
      addressCollateralMarket,
      liquidatorAccountAddress,
      liquidateAccountAddress,
      amountBN.toString()
    );
  }
  */

  async liquidateBorrow(
    accountToLiquidate,
    borrowMarketSymbol,
    amountToLiquidate
  ) {
    const collateralAddress = this.addressesContract[COLLATERAL_TO_USE];
    const contractInstance = this.contractInstances.get(borrowMarketSymbol);

    const signer = contractInstance.connect(this.wallet);

    if (!(borrowMarketSymbol === CRBTC_SYMBOL)) {
      return signer.liquidateBorrow(
        accountToLiquidate,
        amountToLiquidate,
        collateralAddress
      );
    }
    return signer.liquidateBorrow(accountToLiquidate, collateralAddress, {
      value: amountToLiquidate,
    });
  }
}

module.exports = Middleware;
