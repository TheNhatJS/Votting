// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DeployModule = buildModule("Module", (m) => {
  const vote = m.contract("VoteElection");
  return {vote};
});

export default DeployModule;
