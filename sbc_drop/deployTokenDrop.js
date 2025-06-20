require("dotenv").config();
const { ThirdwebSDK } = require("@thirdweb-dev/sdk");
const { ethers } = require("ethers");

// Setup signer
const signer = new ethers.Wallet(
  process.env.PRIVATE_KEY,
  new ethers.providers.JsonRpcProvider(process.env.RPC_URL)
);

const sdk = ThirdwebSDK.fromSigner(signer, "polygon-zkevm-testnet", {
  secretKey: process.env.THIRDWEB_SECRET_KEY,
});

async function main() {
  console.log("🚀 Deploying TokenDrop contract...");

  const tokenDrop = await sdk.deployer.deployBuiltInContract("token-drop", {
    name: "SabiCash TokenDrop",
    symbol: "SABI",
    primary_sale_recipient: process.env.SALE_WALLET || signer.address,
  });

  console.log("✅ TokenDrop deployed to:", tokenDrop.address);
}

main().catch(console.error);
