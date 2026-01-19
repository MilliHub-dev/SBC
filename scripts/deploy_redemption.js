const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Sabi Cash Token Address - Replace with the one from ThirdWeb or env
  const sabiTokenAddress = process.env.SABI_CASH_CONTRACT_ADDRESS;
  if (!sabiTokenAddress) {
    console.error("Please set SABI_CASH_CONTRACT_ADDRESS in .env");
    process.exit(1);
  }

  // Signer Address - The backend wallet that signs redemption requests
  // Defaults to the deployer if not set
  const signerAddress = process.env.OPERATOR_ADDRESS || deployer.address;

  console.log("Sabi Token Address:", sabiTokenAddress);
  console.log("Signer Address:", signerAddress);

  const PointRedemption = await hre.ethers.getContractFactory("PointRedemption");
  const redemption = await PointRedemption.deploy(sabiTokenAddress, signerAddress);

  await redemption.waitForDeployment();

  console.log("PointRedemption deployed to:", await redemption.getAddress());
  
  // Verify command hint
  console.log("\nTo verify on PolygonScan:");
  console.log(`npx hardhat verify --network polygon-zkevm-testnet ${await redemption.getAddress()} ${sabiTokenAddress} ${signerAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
