const { ethers } = require("ethers");
const { abi, constants, addresses } = require("./constants");
const { HTTP_PROVIDER, NETWORK_ID } = require("../config/constants");

class FactoryContract {
  constructor() {
    const chainId = NETWORK_ID;
    this.addressContract = addresses[chainId];
  }

  getSigner() {
    const provider = new ethers.getDefaultProvider(HTTP_PROVIDER);
    const format = provider.formatter.formats;
    const signer = provider.getSigner();
    Object.assign(signer.provider.formatter, { format });
    return signer;
  }

  getContractCtoken(name) {
    if (this.validateContractName(name)) {
      const abiCtoken = name == "cRBTC" ? abi.cRBTC : abi.cErc20;
      return this.createContract(
        this.addressContract[name],
        abiCtoken,
        // TODO could be replaced by const, because below been instantiate another DefaultProvider
        new ethers.getDefaultProvider(HTTP_PROVIDER)
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
        new ethers.getDefaultProvider(HTTP_PROVIDER)
      );
    } else console.log("Invalid contract");
  }
}

module.exports = FactoryContract;
