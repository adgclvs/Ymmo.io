// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.24;

import "./Ymmo.sol";
import "./Bank.sol";
import "../contants/index.js";
import "@openzeppelin/contracts/access/Ownable.sol";

contract YmmoFactory is Ownable {
    address private bankAddress;
    address private _usdcContract;
    Ymmo[] private listOfYmmo;

    event NewContractYmmoDeploy(address contractAddress);
    event USDCContractUpdated(address newUSDCContract);
    event BankAddressUpdated(address newBankAddress);

    constructor() Ownable(msg.sender) {
        setUSDCContract(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
        setBankAddress(address(new Bank(_usdcContract))); //Change _usdcContract with the usdc Contract on the correct chain
    }

    function setUSDCContract(address usdcAddress) public onlyOwner {
        _usdcContract = usdcAddress;
        emit USDCContractUpdated(usdcAddress);
    }

    function setBankAddress(address _bankAddress) public onlyOwner {
        bankAddress = _bankAddress;
        emit BankAddressUpdated(_bankAddress);
    }

    function createYmmo(uint128 _valueOfYmmo, uint64 _indexOfYmmo) external onlyOwner {
        Ymmo ymmo = new Ymmo(_valueOfYmmo, _indexOfYmmo, bankAddress);
        listOfYmmo.push(ymmo);
        emit NewContractYmmoDeploy(address(ymmo));
    }

    function getListOfYmmo() external view returns (Ymmo[] memory) {
        return listOfYmmo;
    }
}
