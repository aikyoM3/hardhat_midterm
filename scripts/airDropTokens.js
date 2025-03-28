const { ethers } = require("hardhat");

async function main() {
  const [owner] = await ethers.getSigners(); // Use the deployer's wallet
  const token = await ethers.getContractAt("Token", "0x5fbdb2315678afecb367f032d93f642f64180aa3", owner);
  
  const recipient = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Change to your address
  const tx = await token.transfer(recipient, ethers.utils.parseUnits("10000", 18));
  await tx.wait();

  console.log(`✅ Sent 10000 MTK to ${recipient}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
