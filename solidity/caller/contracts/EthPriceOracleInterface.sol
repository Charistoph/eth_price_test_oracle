pragma solidity >=0.5.0;

interface EthPriceOracleInterface {
    function getLatestEthPrice() external returns (uint256);
}
/*
contract EthPriceOracleInterface {
    function getLatestEthPrice() public returns (uint256);
}
*/
