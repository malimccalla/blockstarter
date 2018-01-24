pragma solidity ^0.4.17;

contract Campaign {
    address public manager;
    uint public minimumContribution;
    mapping(address => bool) public approvers;
    uint public raised;
    Request[] public requests;
    uint public approversCount;

    struct Request {
        // value types
        bool complete;
        address recipient;
        uint value;
        string description;
        uint approvalCount;
        // reference types do not need to be passed default values on instantiation
        mapping(address => bool) approvals; // track who has voted
    }

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    function Campaign(uint minimum) public {
        manager = msg.sender;
        minimumContribution = minimum;
        raised = 0;
    }

    function contribute() public payable {
        require(msg.value > minimumContribution);
        approvers[msg.sender] = true;
        raised += msg.value;
        approversCount++;
    }

    function createRequest(string description, uint value, address recipient)
        public restricted {
            Request memory newRequest = Request({
                description: description,
                value: value,
                recipient: recipient,
                complete: false,
                approvalCount: 0
            });

            requests.push(newRequest);
    }

    function approveRequest(uint index) public {
        // storage keyword here allows us to modify original requests not a copy
        Request storage request = requests[index];

        require(approvers[msg.sender]);
        require(!request.approvals[msg.sender]);

        request.approvals[msg.sender] = true;
        request.approvalCount++;
    }

    function finalizeRequest(uint index) public restricted {
        Request storage request = requests[index];

        require(request.approvalCount > (approversCount / 2));
        require(!request.complete);

        request.recipient.transfer(request.value);
        request.complete = true;
    }
}
