const FactoryContract = require("./factoryContract");

class Middleware {
  constructor() {
    this.factoryContractInstance = new FactoryContract();
  }
  async getAccountLiquidity(account) {
    const contract = this.factoryContractInstance.getContractByNameAndAbiName(
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
