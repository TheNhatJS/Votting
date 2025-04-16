// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract VoteElection {
    struct Election {
        string name;
        uint256 endTime;
        string[] candidates;
        string[] imageUrl;
        string imageUrlElection;
        mapping(string => uint256) votes;
        mapping(address => bool) hasVoted;
        mapping(address => bool) allowedVoters;
        address[] allowedVotersArray;
        string describe;
        bool exists;
        string winner;
        uint256 highestVotes;
    }

    struct CandidateVotes {
        string name;
        uint256 votes;
        string imageUrl;
    }

    struct DataElection {
        uint256 idElection;
        string name;
        string imageUrlElection;
        string describe;
        uint256 endTime;
        string[] candidates;
    }

    struct DetailElection {
        string name;
        string describe;
        uint256 endTime;
        bool hasVote;
        string winnerName;
        uint256 highestVotes;
        address[] allowedVoters;
        string imageURLElection;
    }

    address public owner;
    uint256 public electionID;
    mapping(uint256 => Election) public elections;

    uint256[] public electionIDs;

    event ElectionCreated(
        uint256 indexed electionID,
        string name,
        uint256 endTime
    );
    event VoteCasted(
        uint256 indexed electionID,
        address indexed voter,
        string candidate
    );
    event ElectionDeleted(uint256 indexed electionID);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier electionExists(uint256 electionId) {
        require(elections[electionId].exists, "Election does not exist");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function transferOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }

    function createElection(
        string memory name,
        uint256 durationInMinutes,
        string[] memory candidates,
        string[] memory imageUrl,
        string memory imageUrlElection,
        address[] memory allowedVoters,
        string memory _describe
    ) public onlyOwner {
        require(candidates.length > 0, "There must be at least one candidate");
        require(
            candidates.length == imageUrl.length,
            "Candidates and image URLs must match"
        );
        require(
            allowedVoters.length > 0,
            "There must be at least one allowed voter"
        );

        electionID++;

        Election storage newElection = elections[electionID];
        newElection.name = name;
        newElection.endTime = block.timestamp + durationInMinutes * 1 minutes;
        newElection.exists = true;
        newElection.candidates = candidates;
        newElection.imageUrl = imageUrl;
        newElection.imageUrlElection = imageUrlElection;
        newElection.describe = _describe;
        newElection.winner = "Final result draw";

        for (uint256 i = 0; i < allowedVoters.length; i++) {
            newElection.allowedVoters[allowedVoters[i]] = true;
            newElection.allowedVotersArray.push(allowedVoters[i]);
        }

        electionIDs.push(electionID);

        emit ElectionCreated(electionID, name, newElection.endTime);
    }

    function registerVote(uint256 _electionID)
        external
        electionExists(_electionID)
    {
        Election storage election = elections[_electionID];

        require(block.timestamp <= election.endTime, "Election has ended");
        require(!election.hasVoted[msg.sender], "Voter has already voted");
        require(!election.allowedVoters[msg.sender], "Voter already registered");
        require(msg.sender.balance >= 0.03 ether, "Minimum 0.03 ETH required");

        election.allowedVoters[msg.sender] = true;
        election.allowedVotersArray.push(msg.sender);
    }

    function setCandidates(
        uint256 electionId,
        string[] memory newCandidates,
        string[] memory newImageUrl
    ) public onlyOwner electionExists(electionId) {
        require(
            newCandidates.length > 0,
            "There must be at least one candidate"
        );
        require(
            newCandidates.length == newImageUrl.length,
            "Candidates and image URLs must match"
        );

        Election storage election = elections[electionId];
        election.candidates = newCandidates;
        election.imageUrl = newImageUrl;
    }

    function setAllowedVoters(
        uint256 _electionID,
        address[] memory newAllowedVoters
    ) public onlyOwner electionExists(_electionID) {
        require(
            newAllowedVoters.length > 0,
            "There must be at least one allowed voter"
        );

        Election storage election = elections[_electionID];

        for (uint256 i = 0; i < election.allowedVotersArray.length; i++) {
            address oldVoter = election.allowedVotersArray[i];
            delete election.allowedVoters[oldVoter];
        }
        delete election.allowedVotersArray;

        for (uint256 i = 0; i < newAllowedVoters.length; i++) {
            address newVoter = newAllowedVoters[i];
            election.allowedVoters[newVoter] = true;
            election.allowedVotersArray.push(newVoter);
        }
    }

    function vote(uint256 electionId, string memory candidate)
        public
        electionExists(electionId)
    {
        Election storage election = elections[electionId];

        require(block.timestamp <= election.endTime, "Election has ended");
        require(
            election.allowedVoters[msg.sender],
            "You are not allowed to vote in this election"
        );
        require(!election.hasVoted[msg.sender], "You have already voted");
        require(
            isCandidate(candidate, election.candidates),
            "Invalid candidate"
        );

        election.votes[candidate]++;
        election.hasVoted[msg.sender] = true;

        if (election.votes[candidate] > election.highestVotes) {
            election.highestVotes = election.votes[candidate];
            election.winner = candidate;
        } else if (election.votes[candidate] == election.highestVotes) {
            election.winner = "Final result draw"; // Tie
        }

        emit VoteCasted(electionId, msg.sender, candidate);
    }

    function getElectionWinner(uint256 electionId)
        public
        view
        electionExists(electionId)
        returns (string memory, uint256)
    {
        Election storage election = elections[electionId];
        return (election.winner, election.highestVotes);
    }

    function isCandidate(string memory candidate, string[] memory candidates)
        internal
        pure
        returns (bool)
    {
        for (uint256 i = 0; i < candidates.length; i++) {
            if (
                keccak256(abi.encodePacked(candidates[i])) ==
                keccak256(abi.encodePacked(candidate))
            ) {
                return true;
            }
        }
        return false;
    }

    function deleteElection(uint256 electionId)
        public
        onlyOwner
        electionExists(electionId)
    {
        Election storage election = elections[electionId];

        for (uint256 i = 0; i < election.allowedVotersArray.length; i++) {
            address voter = election.allowedVotersArray[i];
            delete election.allowedVoters[voter];
        }

        delete elections[electionId];

        for (uint256 i = 0; i < electionIDs.length; i++) {
            if (electionIDs[i] == electionId) {
                electionIDs[i] = electionIDs[electionIDs.length - 1];
                electionIDs.pop();
                break;
            }
        }

        emit ElectionDeleted(electionId);
    }

    function getAllElections() public view returns (DataElection[] memory) {
        DataElection[] memory result = new DataElection[](electionIDs.length);

        for (uint256 i = 0; i < electionIDs.length; i++) {
            uint256 id = electionIDs[i];
            Election storage election = elections[id];
            result[i] = DataElection({
                idElection: id,
                name: election.name,
                imageUrlElection: election.imageUrlElection,
                describe: election.describe,
                endTime: election.endTime,
                candidates: election.candidates
            });
        }
        return result;
    }

    function getCandidateVotes(uint256 electionId)
        public
        view
        electionExists(electionId)
        returns (CandidateVotes[] memory)
    {
        Election storage election = elections[electionId];
        CandidateVotes[] memory candidateVotes = new CandidateVotes[](
            election.candidates.length
        );

        for (uint256 i = 0; i < election.candidates.length; i++) {
            string memory candidate = election.candidates[i];
            candidateVotes[i] = CandidateVotes({
                name: candidate,
                votes: election.votes[candidate],
                imageUrl: election.imageUrl[i]
            });
        }
        return candidateVotes;
    }

    function detailElection(uint256 electionId)
        public
        view
        returns (DetailElection memory)
    {
        Election storage election = elections[electionId];
        DetailElection memory detailE = DetailElection(
            election.name,
            election.describe,
            election.endTime,
            election.hasVoted[msg.sender],
            election.winner,
            election.highestVotes,
            election.allowedVotersArray,
            election.imageUrlElection
        );
        return detailE;
    }
}
