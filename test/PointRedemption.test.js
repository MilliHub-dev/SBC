const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PointRedemption", function () {
  let PointRedemption;
  let pointRedemption;
  let MockToken;
  let mockToken;
  let signer;
  let user;

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    signer = signers[1];
    user = signers[2];

    // Deploy MockToken
    MockToken = await ethers.getContractFactory("MockToken");
    mockToken = await MockToken.deploy("MockToken", "MTK");
    // In ethers v6 waitForDeployment, v5 deployed()
    // We are using hardhat-toolbox 2.0.2 which uses ethers v5
    await mockToken.deployed();

    // Deploy PointRedemption
    PointRedemption = await ethers.getContractFactory("PointRedemption");
    pointRedemption = await PointRedemption.deploy(mockToken.address, signer.address);
    await pointRedemption.deployed();

    // Fund the PointRedemption contract with tokens
    await mockToken.transfer(pointRedemption.address, ethers.utils.parseUnits("1000", 18));
  });

  it("Should redeem tokens with a valid signature", async function () {
    const amount = ethers.utils.parseUnits("10", 18);
    const nonce = 1;

    // Create hash of the message
    // Corresponds to solidity: keccak256(abi.encodePacked(msg.sender, amount, nonce));
    const messageHash = ethers.utils.solidityKeccak256(
      ["address", "uint256", "uint256"],
      [user.address, amount, nonce]
    );

    // Sign the binary data
    const messageBytes = ethers.utils.arrayify(messageHash);
    const signature = await signer.signMessage(messageBytes);

    // User calls redeem
    await expect(pointRedemption.connect(user).redeemTokens(amount, nonce, signature))
      .to.emit(pointRedemption, "TokensRedeemed")
      .withArgs(user.address, amount, nonce);

    // Check balance
    expect(await mockToken.balanceOf(user.address)).to.equal(amount);
  });

  it("Should fail with an invalid signature", async function () {
    const amount = ethers.utils.parseUnits("10", 18);
    const nonce = 1;

    const messageHash = ethers.utils.solidityKeccak256(
      ["address", "uint256", "uint256"],
      [user.address, amount, nonce]
    );

    const messageBytes = ethers.utils.arrayify(messageHash);
    // Sign with wrong account (user instead of signer)
    const signature = await user.signMessage(messageBytes);

    await expect(
      pointRedemption.connect(user).redeemTokens(amount, nonce, signature)
    ).to.be.revertedWith("Invalid signature");
  });

  it("Should fail if nonce is reused", async function () {
    const amount = ethers.utils.parseUnits("10", 18);
    const nonce = 1;

    const messageHash = ethers.utils.solidityKeccak256(
      ["address", "uint256", "uint256"],
      [user.address, amount, nonce]
    );

    const messageBytes = ethers.utils.arrayify(messageHash);
    const signature = await signer.signMessage(messageBytes);

    // First redemption
    await pointRedemption.connect(user).redeemTokens(amount, nonce, signature);

    // Second redemption with same nonce
    await expect(
      pointRedemption.connect(user).redeemTokens(amount, nonce, signature)
    ).to.be.revertedWith("Nonce already used");
  });
});
