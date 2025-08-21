const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting Sabi Cash deployment on Polygon zkEVM Testnet...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH");

  // USDT token address on Polygon zkEVM Testnet
  // TODO: Replace with actual USDT contract address when available
  const USDT_ADDRESS = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"; // Placeholder
  
  // Deploy SabiCash contract
  console.log("\n📦 Deploying SabiCash contract...");
  const SabiCash = await ethers.getContractFactory("SabiCash");
  
  const sabiCash = await SabiCash.deploy(
    USDT_ADDRESS,
    deployer.address // Initial owner
  );

  await sabiCash.deployed();

  console.log("✅ SabiCash deployed to:", sabiCash.address);
  console.log("👤 Contract owner:", await sabiCash.owner());

  // Verify deployment
  console.log("\n🔍 Verifying contract deployment...");
  const name = await sabiCash.name();
  const symbol = await sabiCash.symbol();
  const decimals = await sabiCash.decimals();
  const maxSupply = await sabiCash.MAX_SUPPLY();

  console.log("📛 Token Name:", name);
  console.log("🏷️  Token Symbol:", symbol);
  console.log("🔢 Decimals:", decimals.toString());
  console.log("📊 Max Supply:", ethers.utils.formatEther(maxSupply), "SBC");

  // Display mining plans
  console.log("\n⛏️  Mining Plans Configuration:");
  const plans = ["FREE", "BASIC", "PREMIUM"];
  for (let i = 0; i < plans.length; i++) {
    const plan = await sabiCash.miningPlans(i);
    console.log(`${plans[i]} Plan:`);
    console.log(`  - Deposit: ${ethers.utils.formatEther(plan.deposit)} SBC`);
    console.log(`  - Daily Reward: ${ethers.utils.formatEther(plan.dailyReward)} SBC`);
    console.log(`  - Duration: ${plan.duration} days`);
    console.log(`  - Auto Trigger: ${plan.autoTrigger}`);
  }

  // Display conversion rates
  console.log("\n💱 Conversion Rates:");
  const ethRate = await sabiCash.ethToSabiRate();
  const usdtRate = await sabiCash.usdtToSabiRate();
  console.log(`ETH to SBC: 1 ETH = ${ethRate} SBC`);
  console.log(`USDT to SBC: 1 USDT = ${usdtRate} SBC`);

  // Save deployment info
  const deploymentInfo = {
    network: "polygon-zkevm-testnet",
    contractAddress: sabiCash.address,
    deployerAddress: deployer.address,
    blockNumber: sabiCash.deployTransaction.blockNumber,
    transactionHash: sabiCash.deployTransaction.hash,
    gasUsed: sabiCash.deployTransaction.gasLimit.toString(),
    timestamp: new Date().toISOString(),
    contractDetails: {
      name,
      symbol,
      decimals: decimals.toString(),
      maxSupply: ethers.utils.formatEther(maxSupply),
      ethToSabiRate: ethRate.toString(),
      usdtToSabiRate: usdtRate.toString(),
      usdtTokenAddress: USDT_ADDRESS
    }
  };

  // Write deployment info to file
  const fs = require('fs');
  fs.writeFileSync(
    'deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n✅ Deployment completed successfully!");
  console.log("📄 Deployment info saved to deployment-info.json");
  console.log("\n📋 Contract Details:");
  console.log("Contract Address:", sabiCash.address);
  console.log("Transaction Hash:", sabiCash.deployTransaction.hash);
  console.log("Block Number:", sabiCash.deployTransaction.blockNumber);

  console.log("\n🔗 Next Steps:");
  console.log("1. Update SABI_CASH_CONTRACT_ADDRESS in src/config/web3Config.js");
  console.log("2. Add USDT contract address when available");
  console.log("3. Verify contract on PolygonScan zkEVM");
  console.log("4. Set up backend API endpoints for point conversion");
  console.log("5. Configure authorized minters for reward distribution");

  // Verification command
  console.log("\n🔍 To verify the contract on PolygonScan zkEVM, run:");
  console.log(`npx hardhat verify --network polygon-zkevm-testnet ${sabiCash.address} "${USDT_ADDRESS}" "${deployer.address}"`);

  return {
    sabiCash: sabiCash.address,
    deployer: deployer.address,
    transactionHash: sabiCash.deployTransaction.hash
  };
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then((deploymentData) => {
    console.log("\n🎉 Deployment successful!");
    console.log("📋 Summary:", deploymentData);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });