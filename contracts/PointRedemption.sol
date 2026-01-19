// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PointRedemption is Ownable, ReentrancyGuard {
  using ECDSA for bytes32;
  using MessageHashUtils for bytes32;

  IERC20 public sabiToken;
  address public signerAddress;
  
  mapping(uint256 => bool) public usedNonces;

  event TokensRedeemed(address indexed user, uint256 amount, uint256 nonce);
  event SignerUpdated(address newSigner);
  event TokenUpdated(address newToken);

  constructor(address _sabiToken, address _signer) Ownable(msg.sender) {
    sabiToken = IERC20(_sabiToken);
    signerAddress = _signer;
  }

    function setSigner(address _signer) external onlyOwner {
        signerAddress = _signer;
        emit SignerUpdated(_signer);
    }

    function setToken(address _token) external onlyOwner {
        sabiToken = IERC20(_token);
        emit TokenUpdated(_token);
    }

    function redeemTokens(uint256 amount, uint256 nonce, bytes calldata signature) external nonReentrant {
        require(!usedNonces[nonce], "Nonce already used");
        require(signerAddress != address(0), "Signer not set");

        bytes32 message = keccak256(abi.encodePacked(msg.sender, amount, nonce));
        bytes32 ethSignedMessageHash = message.toEthSignedMessageHash();
        
        address recoveredSigner = ethSignedMessageHash.recover(signature);
        require(recoveredSigner == signerAddress, "Invalid signature");

        usedNonces[nonce] = true;
        
        require(sabiToken.transfer(msg.sender, amount), "Transfer failed");
        
        emit TokensRedeemed(msg.sender, amount, nonce);
    }

    // Function to withdraw tokens if needed (emergency)
    function withdrawTokens(uint256 amount) external onlyOwner {
        sabiToken.transfer(owner(), amount);
    }
}
