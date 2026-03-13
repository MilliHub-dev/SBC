const fs = require("fs");
const bs58 = require("bs58").default;
const { Keypair } = require("@solana/web3.js");

// Load your wallet
const wallet = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(fs.readFileSync("creator.json")))
);


// RPC endpoint
const rpcEndpoint = "https://api.mainnet-beta.solana.com";

// Your Sabi Cash mint address (can be overridden via env MINT_ADDRESS)
const mintAddress = process.env.MINT_ADDRESS || "7wTMaG68N6NrBCchmtLcpEW3imV6rdiRgkA15gGg7VbD";

// IPFS JSON URI that contains metadata (name, symbol, description, image)
const metadataUri = "https://ipfs.io/ipfs/bafkreia7sb7ajhs5alv3qnnatce7pvi3jpleqqqyaspjsdilmwlacdbcmy"; // replace with your JSON CID
const metadataTitle = "Sabi Cash";
const metadataSymbol = "SBC";

(async () => {
  const { createUmi } = await import("@metaplex-foundation/umi-bundle-defaults");
  const { publicKey, signerIdentity, createSignerFromKeypair } = await import("@metaplex-foundation/umi");
  const { createMetadataAccountV3, findMetadataPda } = await import("@metaplex-foundation/mpl-token-metadata");

  const umi = createUmi(rpcEndpoint);

  const umiKeypair = umi.eddsa.createKeypairFromSecretKey(wallet.secretKey);
  const signer = createSignerFromKeypair(umi, umiKeypair);
  umi.use(signerIdentity(signer));

  const mint = publicKey(mintAddress);
  const metadataPda = findMetadataPda(umi, { mint });

  const builder = createMetadataAccountV3(umi, {
    metadata: metadataPda,
    mint,
    mintAuthority: signer,
    payer: signer,
    updateAuthority: signer,
    data: {
      name: metadataTitle,
      symbol: metadataSymbol,
      uri: metadataUri,
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null,
    },
    isMutable: true,
    collectionDetails: null,
  });

  const result = await builder.sendAndConfirm(umi);
  const signatureBase58 = bs58.encode(result.signature);
  console.log("Metadata created. Tx signature:", signatureBase58);
  console.log(`Explorer: https://explorer.solana.com/tx/${signatureBase58}?cluster=mainnet-beta`);
})();
