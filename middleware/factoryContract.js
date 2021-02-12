const { ethers } = require("ethers");
const { abi, constants, addresses } = require("./constants");

class FactoryContract {
  constructor() {
    const chainId = 31; //NETWORK_ID
    this.addressContract = addresses[chainId];
  }
  getContractCtoken(name) {
    if (this.validateContractName(name)) {
      const abiCtoken = name == "cRBTC" ? abi.cRBTC : abi.cErc20;
      return this.createContract(
        this.addressContract[name],
        abiCtoken,
        new ethers.getDefaultProvider(process.env.VUE_APP_HTTP_PROVIDER)
      );
    }
  }

  validateContractName(name) {
    if (!Object.prototype.hasOwnProperty.call(constants, name)) {
      console.error(`contract name (${name}) not exist in constants`);
      return false;
    }
    return true;
  }

  createContract(address, abi, provider) {
    return new ethers.Contract(address, abi, provider);
  }

  getContractByNameAndAbiName(nameContract, nameAbi) {
    if (
      this.validateContractName(nameContract) &&
      Object.prototype.hasOwnProperty.call(abi, nameAbi)
    ) {
      return this.createContract(
        this.addressContract[nameContract],
        abi[nameAbi],
        Vue.web3Provider
      );
    }
  }
}

module.exports = FactoryContract;
