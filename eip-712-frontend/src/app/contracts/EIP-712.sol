// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

contract Greeter {
    string public greetingText = "Hello World!";
    address public greetingSender;  //0xf80d2D0D9CEEe7263923EC629C372FC14bcA0d89

    struct EIP712Domain {
        string  name;
        string  version;
        uint256 chainId;
        address verifyingContract;
    }

    struct Greeting {
        string text;
        uint deadline;
    }

    bytes32 DOMAIN_SEPARATOR;

    constructor () {
        DOMAIN_SEPARATOR = domainHash(EIP712Domain({
            name: "Ether Mail",
            version: '1',
            chainId: block.chainid,
            verifyingContract: address(this)
        }));
    }

    function domainHash(EIP712Domain memory eip712Domain) internal pure returns (bytes32) {
        return keccak256(abi.encode(
            keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
            keccak256(bytes(eip712Domain.name)),
            keccak256(bytes(eip712Domain.version)),
            eip712Domain.chainId,
            eip712Domain.verifyingContract
        ));
    }

    function structHash(Greeting memory greeting) internal pure returns (bytes32) {
        return keccak256(abi.encode(
            keccak256("Greeting(string text,uint deadline)"),
            keccak256(bytes(greeting.text)),
            greeting.deadline
        ));
    }

    function verify(Greeting memory greeting, address sender, uint8 v, bytes32 r, bytes32 s) public view returns (bool) {
        bytes32 digest = keccak256(abi.encodePacked(
            "\x19\x01",
            DOMAIN_SEPARATOR,
            structHash(greeting)
        ));
        return ecrecover(digest, v, r, s) == sender;
    }

    function greet(Greeting memory greeting, address sender, uint8 v, bytes32 r, bytes32 s) public {
        require(verify(greeting, sender, v, r, s), "Invalid signature");
        require(block.timestamp <= greeting.deadline, "Deadline reached");
        greetingText = greeting.text;
        greetingSender = sender;
    }
}