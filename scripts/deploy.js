const path = require("path");

async function main() {
  if (network.name === "hardhat") {
    console.warn("Deploying to Hardhat Network. Use --network localhost for persistence.");
  }

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", await deployer.getAddress());
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy();
  await token.deployed();

  console.log("Token address:", token.address);

  // Set initial transaction fee (1%)
  const initialFee = 100; // 100 basis points = 1%
  const tx = await token.setTransactionFee(initialFee);
  await tx.wait();
  console.log("Initial transaction fee set to 1%");

  saveFrontendFiles(token);
}

function saveFrontendFiles(token) {
  const fs = require("fs");
  const contractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ Token: token.address }, undefined, 2)
  );

  const TokenArtifact = artifacts.readArtifactSync("Token");

  fs.writeFileSync(
    path.join(contractsDir, "Token.json"),
    JSON.stringify(TokenArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
