const Mongo = require("../Mongo");
const BigNumber = require("bignumber.js");
const { ethers } = require("ethers");
const {
  abi,
  cTokensDetails,
  constants,
  addresses,
  decimals,
} = require("./constants");
const {
  HTTP_PROVIDER,
  INITIAL_BLOCK,
  CRBTC_SYMBOL,
  NETWORK_ID,
  PRIVATE_KEY_WALLET,
  COLLATERAL_TO_USE,
  LIQUIDATOR_ADDRESS,
} = require("../config/constants");

BigNumber.set({ EXPONENTIAL_AT: [-18, 36] });

class Middleware {
  constructor() {
    this.mongoInstance = new Mongo();
    this.provider = new ethers.providers.JsonRpcProvider(HTTP_PROVIDER);
    this.addressesContract = addresses[NETWORK_ID];
    this.contractInstances = this.generateContractInstances();
    this.wallet = new ethers.Wallet(PRIVATE_KEY_WALLET, this.provider);
    this.factor = 1e18;
    this.gasLimit = 250000;
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

  async getLiquidationFactor() {
    const contract = this.getContractByNameAndAbiName(
      constants.Unitroller,
      constants.Comptroller
    );
    const liqFactor = await contract.closeFactorMantissa();
    return liqFactor;
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
  /**
   * @notice returns the max amount that asset can be liquidate
   * @param borrowAccount The borrower address account that are in shortfall
   * @param borrowAmount The borrow amount expressed in USD
   * @param borrowMarket The market where was made the borrow by borrower address
   */

  async maxToLiquidate(borrowAccount, borrowAmount, borrowMarket) {
    // the borrower account are entered in market given my COLLATERAL_TO_USE?
    if (!(await this.checkIsCollateral(borrowAccount)))
      throw Error("The borrower doesn't have the COLLATERAL_TO_USE");

    const priceToken = (await this.getPriceInDecimals(borrowMarket)).toString();
    const priceTokenLiquidatorCollateral = (
      await this.getPriceInDecimals(COLLATERAL_TO_USE)
    ).toString();

    const liqFactor = (await this.getLiquidationFactor()).toString();

    const borrowPerCloseFactor = new BigNumber(borrowAmount)
      .multipliedBy(liqFactor)
      .div(this.factor)
      .div(priceToken)
      .toString();

    const maxAssetCollateralBorrower = new BigNumber(
      await this.getBalanceTokens(borrowAccount)
    )
      .multipliedBy(priceTokenLiquidatorCollateral)
      .div(priceToken)
      .toString();

    const balanceOfLiquidatorToken = await this.getWalletAccountBalance(
      borrowMarket
    );
    const gasPrice = await this.getGasPrice();
    const fullFunds = new BigNumber(balanceOfLiquidatorToken).minus(
      gasPrice.multipliedBy(this.gasLimit)
    );
    const maxFunds = fullFunds.isNegative() ? 0 : fullFunds.toString();

    // SI ES RBTC, HAY QUE HACER LA RESTA
    return BigNumber.minimum(
      borrowAmount, // change for maxCollateralSuplied in contract
      borrowPerCloseFactor, // max percentage that can be liquidated
      maxAssetCollateralBorrower,
      maxFunds // max funds lol
    );
  }

  async getBalanceTokens(accountAddress) {
    const contractInstance = this.contractInstances.get(COLLATERAL_TO_USE);
    const balance = await contractInstance.callStatic.balanceOfUnderlying(
      accountAddress
    );
    return ethers.utils.formatUnits(
      balance,
      decimals[COLLATERAL_TO_USE.substr(1)]
    );
  }

  async getWalletAccountBalance(marketSymbol) {
    if (marketSymbol === CRBTC_SYMBOL) return getWalletAccountBalanceRBTC();
    const tokenSymbol = marketSymbol.substr(1);
    const tokenAddress = this.addressesContract[tokenSymbol];
    const abi = ["function balanceOf(address) returns (uint)"];
    const contractInstance = new ethers.Contract(
      tokenAddress,
      abi,
      this.provider
    );
    const balance = await contractInstance.callStatic.balanceOf(
      LIQUIDATOR_ADDRESS
    );
    return ethers.utils.formatEther(balance);
  }

  async getWalletAccountBalanceRBTC() {
    const balance = await this.provider.getBalance(LIQUIDATOR_ADDRESS);
    return ethers.utils.formatEther(balance);
  }

  async getPriceInDecimals(cToken) {
    const nameContract = "PriceOracleProxy";
    const contractInstanceOracle = new ethers.Contract(
      this.addressesContract[nameContract],
      abi[nameContract],
      this.provider
    );
    const underlyingPrice = await contractInstanceOracle.callStatic.getUnderlyingPrice(
      this.addressesContract[cToken]
    );
    const price = new BigNumber(underlyingPrice.toString()).toNumber();

    return new BigNumber(price).div(this.factor);
  }

  async checkIsCollateral(account) {
    const assets = await this.getAssetsIn(account);

    const collateralLiquidatorAddress = this.addressesContract[
      COLLATERAL_TO_USE
    ];

    return assets.find(
      (asset) =>
        asset.toLowerCase() === collateralLiquidatorAddress.toLowerCase()
    );
  }

  async getAssetsIn(account) {
    const contract = this.getContractByNameAndAbiName(
      constants.Unitroller,
      constants.Comptroller
    );
    return contract.getAssetsIn(account);
  }

  async getGasPrice() {
    return this.provider.getGasPrice().then((price) => {
      return new BigNumber(price.toString()).div(this.factor);
    });
  }
}

module.exports = Middleware;
