const { ethers } = require("hardhat");

async function main() {
  // Set the initial platform fee percentage (in basis points)
  // For example, 500 means 5% fee (500/10000)
  const platformFeePercentage = 500;

  console.log("Deploying ETNPatronAI contract...");
  console.log(`Initial platform fee: ${platformFeePercentage / 100}%`);

  // Get the contract factory
  const ETNPatronAI = await ethers.getContractFactory("ETNPatronAI");

  // Deploy the contract with the initial fee
  const patronAI = await ETNPatronAI.deploy(platformFeePercentage);

  // Wait for deployment to finish
  await patronAI.waitForDeployment();

  // Get the deployed contract address
  const deployedAddress = await patronAI.getAddress();

  console.log(`ETNPatronAI deployed to: ${deployedAddress}`);
  console.log("Deployment completed successfully!");

  // Log information for verification
  console.log("\nTo verify this contract on Etherscan, run:");
  console.log(
    `npx hardhat verify --network ${network.name} ${deployedAddress} ${platformFeePercentage}`
  );
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error during deployment:", error);
    process.exit(1);
  });
