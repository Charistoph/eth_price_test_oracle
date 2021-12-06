pragma solidity >=0.5.0;

interface CallerContractInterface {
    function callback(uint256 _ethPrice, uint256 id) external;
}
/*
contract CallerContractInterface {
    function callback(uint256 _ethPrice, uint256 id) public;
*/
