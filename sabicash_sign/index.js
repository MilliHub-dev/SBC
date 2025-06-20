require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ThirdwebSDK } = require("@thirdweb-dev/sdk");
const RPC_URL = "https://rpc.ankr.com/polygon_zkevm_testnet";

const app = express();
app.use(cors());
app.use(express.json());

// Load env vars
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY;


// Initialize SDK using secret key
const sdk = ThirdwebSDK.fromPrivateKey(
  PRIVATE_KEY,
  "polygon-zkevm-testnet",
  {
    secretKey: THIRDWEB_SECRET_KEY,
     rpcUrl: RPC_URL,
  }
);

// Signature payload endpoint
app.post("/sign-payload", async (req, res) => {
  const { walletAddress, amount } = req.body;

  try {
    const contract = await sdk.getContract(CONTRACT_ADDRESS);

    const signedPayload = await contract.erc20.signature.generate({
      to: walletAddress,
      quantity: amount.toString(), // ensure it's string format
    });

    res.json(signedPayload);
  } catch (err) {
    console.error("Signing error:", err);
    res.status(500).json({ error: "Could not generate payload" });
  }
});

app.get("/", (req, res) => {
  res.send("SabiCash Signature Service is running ✅");
});


// Run server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Signature server running on http://localhost:${PORT}`);
});
