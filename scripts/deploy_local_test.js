const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy MockToken
  const MockToken = await hre.ethers.getContractFactory("MockToken");
  const mockToken = await MockToken.deploy("Sabi Cash", "SBC");
  await mockToken.deployed();
  const mockTokenAddress = mockToken.address;
  console.log("MockToken deployed to:", mockTokenAddress);

  // 2. Deploy PointRedemption
  // Use deployer as signer for simplicity
  const signerAddress = deployer.address;
  
  const PointRedemption = await hre.ethers.getContractFactory("PointRedemption");
  const redemption = await PointRedemption.deploy(mockTokenAddress, signerAddress);
  await redemption.deployed();
  const redemptionAddress = redemption.address;
  console.log("PointRedemption deployed to:", redemptionAddress);

  // 3. Fund the redemption contract
  const fundAmount = hre.ethers.utils.parseEther("10000");
  await mockToken.mint(redemptionAddress, fundAmount);
  console.log(`Funded PointRedemption with ${hre.ethers.utils.formatEther(fundAmount)} SBC`);

  // 4. Verify balance
  const balance = await mockToken.balanceOf(redemptionAddress);
  console.log("PointRedemption balance:", hre.ethers.utils.formatEther(balance));

  console.log("\nLocal Deployment Successful!");
  console.log("----------------------------------------------------");
  console.log(`SABI_CASH_CONTRACT_ADDRESS=${mockTokenAddress}`);
  console.log(`POINT_REDEMPTION_CONTRACT=${redemptionAddress}`);
  console.log(`OPERATOR_ADDRESS=${signerAddress}`);
  console.log("----------------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
