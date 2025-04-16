import { ethers } from "hardhat";
import { expect } from "chai";

describe("Vote Contract", function () {
  let voteContract: any;
  let owner: any;
  let addr1: any;
  let addr2: any;
  let allowedVoters: string[];
  let candidates: string[];
  let imageUrls: string[];
  let imageUrlElection: string;
  let description: string;

  beforeEach(async function () {
    // Deploy the contract
    const Vote = await ethers.getContractFactory("Vote");
    [owner, addr1, addr2] = await ethers.getSigners();
    voteContract = await Vote.deploy(); // Không cần gọi deployed()

    // Initialize test data
    allowedVoters = [addr1.address, addr2.address];
    candidates = ["Alice", "Bob"];
    imageUrls = ["https://example.com/alice.png", "https://example.com/bob.png"];
    imageUrlElection = "https://example.com/election.png";
    description = "Test election description";
  });

  it("Should set the owner correctly", async function () {
    expect(await voteContract.owner()).to.equal(owner.address);
  });

  it("Should create an election", async function () {
    const durationInMinutes = 10;

    await voteContract.createElection(
      "Election 1",
      durationInMinutes,
      candidates,
      imageUrls,
      imageUrlElection,
      allowedVoters,
      description
    );

    const elections = await voteContract.getAllElections();
    expect(elections.length).to.equal(1);
    expect(elections[0].name).to.equal("Election 1");
    expect(elections[0].candidates.length).to.equal(2);
  });

  it("Should allow voting", async function () {
    const durationInMinutes = 10;

    // Create an election
    await voteContract.createElection(
      "Election 1",
      durationInMinutes,
      candidates,
      imageUrls,
      imageUrlElection,
      allowedVoters,
      description
    );

    // Vote for a candidate
    await voteContract.connect(addr1).vote(1, "Alice");

    const votes = await voteContract.getCandidateVotes(1);
    expect(votes[0].votes).to.equal(1); // Alice should have 1 vote
    expect(votes[1].votes).to.equal(0); // Bob should have 0 votes
  });

  it("Should prevent double voting", async function () {
    const durationInMinutes = 10;

    // Create an election
    await voteContract.createElection(
      "Election 1",
      durationInMinutes,
      candidates,
      imageUrls,
      imageUrlElection,
      allowedVoters,
      description
    );

    // First vote
    await voteContract.connect(addr1).vote(1, "Alice");

    // Attempt second vote
    await expect(voteContract.connect(addr1).vote(1, "Alice")).to.be.revertedWith("You have already voted");
  });

  it("Should determine the correct winner", async function () {
    const durationInMinutes = 10;

    // Create an election
    await voteContract.createElection(
      "Election 1",
      durationInMinutes,
      candidates,
      imageUrls,
      imageUrlElection,
      allowedVoters,
      description
    );

    // Vote for candidates
    await voteContract.connect(addr1).vote(1, "Alice");
    await voteContract.connect(addr2).vote(1, "Bob");

    // Verify the winner (tie case)
    const [winner, highestVotes] = await voteContract.getElectionWinner(1);
    expect(winner).to.equal(""); // Tie results in no winner
    expect(highestVotes).to.equal(1);
  });

  it("Should delete an election", async function () {
    const durationInMinutes = 10;

    // Create an election
    await voteContract.createElection(
      "Election 1",
      durationInMinutes,
      candidates,
      imageUrls,
      imageUrlElection,
      allowedVoters,
      description
    );

    // Delete the election
    await voteContract.deleteElection(1);

    // Verify deletion
    const elections = await voteContract.getAllElections();
    expect(elections.length).to.equal(0);
  });
});
