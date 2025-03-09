// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ETNPatronAI
 * @dev Smart contract for managing micro-payments to content creators
 */
contract ETNPatronAI {
    address public owner;
    uint256 public platformFeePercentage; // represented as basis points (1% = 100)
    uint256 private creatorIdCounter;
    uint256 private contentIdCounter;

    struct Creator {
        address payable walletAddress;
        bool isVerified;
        string metadata;
        uint256 totalEarned;
        uint256 subscriberCount;
        uint256 creatorId;
    }

    struct Content {
        uint256 contentId;
        address creatorAddress;
        string content;
        uint256 price; // in wei
        bool isPremium;
        uint256 tipTotal;
        uint256 purchaseCount;
        bytes32 contentHash;
    }

    struct Subscription {
        address subscriber;
        address creator;
        uint256 startTime;
        uint256 endTime;
        uint256 amount;
    }

    mapping(address => Creator) public creators;
    mapping(uint256 => Content) public contents;
    mapping(address => mapping(address => Subscription)) public subscriptions;
    mapping(address => mapping(uint256 => bool)) public purchasedContent;
    mapping(address => uint256) public platformBalance;

    event CreatorRegistered(
        address indexed creatorAddress,
        uint256 creatorId,
        string metadata
    );
    event CreatorUpdated(uint256 creatorId, string metadata);
    event ContentPublished(
        uint256 indexed contentId,
        string indexed content,
        address indexed creatorAddress,
        bytes32 contentHash,
        uint256 price,
        bool isPremium
    );
    event PaymentMade(
        address indexed from,
        address indexed to,
        uint256 contentId,
        uint256 amount
    );
    event TipSent(
        address indexed from,
        address indexed to,
        uint256 contentId,
        uint256 amount
    );
    event SubscriptionStarted(
        address indexed subscriber,
        address indexed creator,
        uint256 startTime,
        uint256 endTime,
        uint256 amount
    );
    event Withdrawal(address indexed creatorAddress, uint256 amount);

    constructor(uint256 _platformFeePercentage) {
        owner = msg.sender;
        platformFeePercentage = _platformFeePercentage;
        creatorIdCounter = 1;
        contentIdCounter = 1;
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only contract owner can call this function"
        );
        _;
    }

    modifier onlyCreator() {
        require(
            creators[msg.sender].walletAddress != address(0),
            "Only registered creators can call this function"
        );
        _;
    }

    function registerCreator(string memory _metadata) external {
        require(
            creators[msg.sender].walletAddress == address(0),
            "Creator already registered"
        );

        uint256 newCreatorId = creatorIdCounter++;
        creators[msg.sender] = Creator({
            walletAddress: payable(msg.sender),
            isVerified: false,
            metadata: _metadata,
            totalEarned: 0,
            subscriberCount: 0,
            creatorId: newCreatorId
        });

        emit CreatorRegistered(msg.sender, newCreatorId, _metadata);
    }

    function updateCreator(string memory _metadata) external onlyCreator {
        creators[msg.sender].metadata = _metadata;
        emit CreatorUpdated(creators[msg.sender].creatorId, _metadata);
    }

    function verifyCreator(address _creatorAddress) external onlyOwner {
        require(
            creators[_creatorAddress].walletAddress != address(0),
            "Creator does not exist"
        );
        creators[_creatorAddress].isVerified = true;
    }

    function publishContent(
        string memory content,
        uint256 _price,
        bool _isPremium
    ) external onlyCreator {
        uint256 newContentId = contentIdCounter++;
        bytes32 contentHash = keccak256(abi.encodePacked(content));
        contents[newContentId] = Content({
            contentId: newContentId,
            content: content,
            contentHash: contentHash,
            creatorAddress: msg.sender,
            price: _price,
            isPremium: _isPremium,
            tipTotal: 0,
            purchaseCount: 0
        });

        emit ContentPublished(
            newContentId,
            content,
            msg.sender,
            contentHash,
            _price,
            _isPremium
        );
    }

    function purchaseContent(uint256 _contentId) external payable {
        Content storage content = contents[_contentId];
        require(content.creatorAddress != address(0), "Content does not exist");
        require(msg.value >= content.price, "Insufficient payment");

        uint256 platformFee = (msg.value * platformFeePercentage) / 10000;
        uint256 creatorPayment = msg.value - platformFee;

        platformBalance[owner] += platformFee;
        creators[content.creatorAddress].totalEarned += creatorPayment;
        purchasedContent[msg.sender][_contentId] = true;
        content.purchaseCount += 1;

        emit PaymentMade(
            msg.sender,
            content.creatorAddress,
            _contentId,
            msg.value
        );
    }

    function tipCreator(uint256 _contentId) external payable {
        Content storage content = contents[_contentId];
        require(content.creatorAddress != address(0), "Content does not exist");
        require(msg.value > 0, "Tip amount must be greater than 0");

        uint256 platformFee = (msg.value * platformFeePercentage) / 10000;
        uint256 tipAmount = msg.value - platformFee;

        platformBalance[owner] += platformFee;
        creators[content.creatorAddress].totalEarned += tipAmount;
        content.tipTotal += tipAmount;

        emit TipSent(msg.sender, content.creatorAddress, _contentId, msg.value);
    }

    function subscribe(address _creatorAddress) external payable {
        require(
            creators[_creatorAddress].walletAddress != address(0),
            "Creator does not exist"
        );
        require(msg.value > 0, "Subscription amount must be greater than 0");

        uint256 subscriptionPeriod = 30 days; // Fixed at 30 days for now
        uint256 platformFee = (msg.value * platformFeePercentage) / 10000;
        uint256 creatorPayment = msg.value - platformFee;

        platformBalance[owner] += platformFee;
        creators[_creatorAddress].totalEarned += creatorPayment;
        creators[_creatorAddress].subscriberCount += 1;

        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + subscriptionPeriod;

        subscriptions[msg.sender][_creatorAddress] = Subscription({
            subscriber: msg.sender,
            creator: _creatorAddress,
            startTime: startTime,
            endTime: endTime,
            amount: msg.value
        });

        emit SubscriptionStarted(
            msg.sender,
            _creatorAddress,
            startTime,
            endTime,
            msg.value
        );
    }

    function isSubscribed(
        address _subscriber,
        address _creator
    ) public view returns (bool) {
        Subscription memory sub = subscriptions[_subscriber][_creator];
        return sub.endTime > block.timestamp;
    }

    function canDecryptContent(
        address _caller,
        uint256 _contentId
    ) public view returns (bool) {
        Content memory content = contents[_contentId];
        bool isNotPremium = !content.isPremium && _contentId < contentIdCounter;
        return
            isNotPremium ||
            content.creatorAddress == _caller ||
            isSubscribed(_caller, content.creatorAddress) ||
            purchasedContent[_caller][_contentId];
    }

    function withdraw() external {
        uint256 amount = 0;

        if (msg.sender == owner) {
            amount = platformBalance[owner];
            platformBalance[owner] = 0;
        } else if (creators[msg.sender].walletAddress != address(0)) {
            amount = creators[msg.sender].totalEarned;
            creators[msg.sender].totalEarned = 0;
        }

        require(amount > 0, "No funds to withdraw");

        payable(msg.sender).transfer(amount);
        emit Withdrawal(msg.sender, amount);
    }

    function updatePlatformFee(uint256 _newFeePercentage) external onlyOwner {
        require(_newFeePercentage <= 3000, "Platform fee cannot exceed 30%");
        platformFeePercentage = _newFeePercentage;
    }
}
