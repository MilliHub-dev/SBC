// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title SabiCash
 * @dev Sabi Cash token contract for the Sabi Ride ecosystem
 * Features: Token minting/burning, ETH/USDT purchases, staking, mining plans
 */
contract SabiCash is ERC20, Ownable, ReentrancyGuard {
    
    // Token configuration
    uint8 private constant DECIMALS = 18;
    uint256 public constant MAX_SUPPLY = 10000000000 * 10**DECIMALS; // 1 billion tokens
    
    // Pricing configuration (can be updated by owner)
    uint256 public ethToSbcRate = 100000; // 1 ETH = 100000 SBC
    uint256 public usdtToSbcRate = 0.4; // 1 USDT = 0.4 SBC
    
    // USDT token contract (Polygon zkEVM Testnet)
    IERC20 public usdtToken;
    
    // Mining Plans
    enum PlanType { FREE, BASIC, PREMIUM }
    
    struct MiningPlan {
        uint256 deposit;       // Required deposit amount
        uint256 dailyReward;   // Daily reward in SBC (scaled by 1e18)
        uint256 duration;      // Duration in days
        bool autoTrigger;      // Auto claim rewards
    }
    
    struct UserStaking {
        PlanType planType;
        uint256 stakedAmount;
        uint256 startTime;
        uint256 lastClaimTime;
        uint256 totalClaimed;
        bool isActive;
    }
    
    struct UserMining {
        uint256 lastClaimTime;
        uint256 totalClaimed;
    }
    
    // Mapping of plan types to plan details
    mapping(PlanType => MiningPlan) public miningPlans;
    
    // User staking information
    mapping(address => UserStaking) public userStaking;
    
    // User mining information (for free plan)
    mapping(address => UserMining) public userMining;
    
    // Authorized minters (for point conversion and rewards)
    mapping(address => bool) public authorizedMinters;
    
    // Events
    event TokensPurchasedWithETH(address indexed buyer, uint256 ethAmount, uint256 sbcAmount);
    event TokensPurchasedWithUSDT(address indexed buyer, uint256 usdtAmount, uint256 sbcAmount);
    event Staked(address indexed user, PlanType planType, uint256 amount);
    event StakingRewardsClaimed(address indexed user, uint256 amount);
    event MiningRewardsClaimed(address indexed user, uint256 amount);
    event PlanUpdated(PlanType planType, uint256 deposit, uint256 dailyReward, uint256 duration, bool autoTrigger);
    event RatesUpdated(uint256 newEthRate, uint256 newUsdtRate);
    
    constructor(
        address _usdtToken,
        address initialOwner
    ) ERC20("Sabi Cash", "SBC") {
        usdtToken = IERC20(_usdtToken);
        
        // Initialize mining plans
        miningPlans[PlanType.FREE] = MiningPlan({
            deposit: 0,
            dailyReward: 0.9 * 10**DECIMALS,
            duration: 1,
            autoTrigger: false
        });
        
        miningPlans[PlanType.BASIC] = MiningPlan({
            deposit: 100 * 10**DECIMALS,
            dailyReward: 15 * 10**DECIMALS,
            duration: 30,
            autoTrigger: false
        });
        
        miningPlans[PlanType.PREMIUM] = MiningPlan({
            deposit: 1000 * 10**DECIMALS,
            dailyReward: 170 * 10**DECIMALS,
            duration: 30,
            autoTrigger: true
        });
        
        // Transfer ownership to the specified address
        _transferOwnership(initialOwner);
        
        // Authorize owner as minter
        authorizedMinters[initialOwner] = true;
    }
    
    /**
     * @dev Returns the number of decimals used for token representation
     */
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }
    
    /**
     * @dev Buy Sabi Cash tokens with ETH
     */
    function buyWithPolygon() external payable nonReentrant {
        require(msg.value > 0, "ETH amount must be greater than 0");
        
        uint256 sbcAmount = msg.value * ethToSbcRate;
        require(totalSupply() + sbcAmount <= MAX_SUPPLY, "Exceeds maximum supply");
        
        _mint(msg.sender, sbcAmount);
        
        emit TokensPurchasedWithETH(msg.sender, msg.value, sbcAmount);
    }
    
    /**
     * @dev Buy Sabi Cash tokens with USDT
     */
    function buyWithUSDT(uint256 usdtAmount) external nonReentrant {
        require(usdtAmount > 0, "USDT amount must be greater than 0");
        
        uint256 sbcAmount = usdtAmount * usdtToSbcRate;
        require(totalSupply() + sbcAmount <= MAX_SUPPLY, "Exceeds maximum supply");
        
        // Transfer USDT from user to contract
        require(usdtToken.transferFrom(msg.sender, address(this), usdtAmount), "USDT transfer failed");
        
        _mint(msg.sender, sbcAmount);
        
        emit TokensPurchasedWithUSDT(msg.sender, usdtAmount, sbcAmount);
    }
    
    /**
     * @dev Stake tokens in a mining plan
     */
    function stake(uint256 amount, PlanType planType) external nonReentrant {
        require(planType != PlanType.FREE, "Cannot stake in free plan");
        require(!userStaking[msg.sender].isActive, "Already staking");
        
        MiningPlan memory plan = miningPlans[planType];
        require(amount == plan.deposit, "Incorrect stake amount");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // Transfer tokens to contract
        _transfer(msg.sender, address(this), amount);
        
        // Set up user staking
        userStaking[msg.sender] = UserStaking({
            planType: planType,
            stakedAmount: amount,
            startTime: block.timestamp,
            lastClaimTime: block.timestamp,
            totalClaimed: 0,
            isActive: true
        });
        
        emit Staked(msg.sender, planType, amount);
    }
    
    /**
     * @dev Claim mining rewards (free plan)
     */
    function claimMiningRewards() external nonReentrant {
        UserMining storage mining = userMining[msg.sender];
        
        // Check if 24 hours have passed since last claim
        require(
            mining.lastClaimTime == 0 || 
            block.timestamp >= mining.lastClaimTime + 1 days,
            "Must wait 24 hours between claims"
        );
        
        uint256 reward = miningPlans[PlanType.FREE].dailyReward;
        require(totalSupply() + reward <= MAX_SUPPLY, "Exceeds maximum supply");
        
        mining.lastClaimTime = block.timestamp;
        mining.totalClaimed += reward;
        
        _mint(msg.sender, reward);
        
        emit MiningRewardsClaimed(msg.sender, reward);
    }
    
    /**
     * @dev Claim staking rewards (paid plans)
     */
    function claimStakingRewards() external nonReentrant {
        UserStaking storage staking = userStaking[msg.sender];
        require(staking.isActive, "Not currently staking");
        
        MiningPlan memory plan = miningPlans[staking.planType];
        
        // Calculate claimable rewards
        uint256 daysSinceLastClaim = (block.timestamp - staking.lastClaimTime) / 1 days;
        require(daysSinceLastClaim > 0, "No rewards to claim yet");
        
        // Calculate total days staked and remaining days
        uint256 totalDaysStaked = (block.timestamp - staking.startTime) / 1 days;
        uint256 maxDays = plan.duration;
        
        if (totalDaysStaked > maxDays) {
            daysSinceLastClaim = maxDays - ((staking.lastClaimTime - staking.startTime) / 1 days);
        }
        
        require(daysSinceLastClaim > 0, "Staking period completed");
        
        uint256 reward = daysSinceLastClaim * plan.dailyReward;
        require(totalSupply() + reward <= MAX_SUPPLY, "Exceeds maximum supply");
        
        staking.lastClaimTime = block.timestamp;
        staking.totalClaimed += reward;
        
        // Check if staking period is complete
        if (totalDaysStaked >= maxDays) {
            // Return staked amount and end staking
            _transfer(address(this), msg.sender, staking.stakedAmount);
            staking.isActive = false;
        }
        
        _mint(msg.sender, reward);
        
        emit StakingRewardsClaimed(msg.sender, reward);
    }
    
    /**
     * @dev Unstake tokens (forfeit remaining rewards)
     */
    function unstake() external nonReentrant {
        UserStaking storage staking = userStaking[msg.sender];
        require(staking.isActive, "Not currently staking");
        
        uint256 stakedAmount = staking.stakedAmount;
        staking.isActive = false;
        
        // Return staked tokens
        _transfer(address(this), msg.sender, stakedAmount);
    }
    
    /**
     * @dev Mint tokens (only authorized minters for point conversion and rewards)
     */
    function mint(address to, uint256 amount) external {
        require(authorizedMinters[msg.sender], "Not authorized to mint");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds maximum supply");
        
        _mint(to, amount);
    }
    
    /**
     * @dev Burn tokens
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
    
    /**
     * @dev Get user staking information
     */
    function getUserStakingInfo(address user) external view returns (
        PlanType planType,
        uint256 stakedAmount,
        uint256 startTime,
        uint256 lastClaimTime,
        uint256 totalClaimed,
        bool isActive,
        uint256 pendingRewards
    ) {
        UserStaking memory staking = userStaking[user];
        planType = staking.planType;
        stakedAmount = staking.stakedAmount;
        startTime = staking.startTime;
        lastClaimTime = staking.lastClaimTime;
        totalClaimed = staking.totalClaimed;
        isActive = staking.isActive;
        
        if (isActive) {
            MiningPlan memory plan = miningPlans[staking.planType];
            uint256 daysSinceLastClaim = (block.timestamp - staking.lastClaimTime) / 1 days;
            uint256 totalDaysStaked = (block.timestamp - staking.startTime) / 1 days;
            
            if (totalDaysStaked <= plan.duration) {
                pendingRewards = daysSinceLastClaim * plan.dailyReward;
            }
        }
    }
    
    /**
     * @dev Get user mining information
     */
    function getUserMiningInfo(address user) external view returns (
        uint256 lastClaimTime,
        uint256 totalClaimed,
        bool canClaim
    ) {
        UserMining memory mining = userMining[user];
        lastClaimTime = mining.lastClaimTime;
        totalClaimed = mining.totalClaimed;
        canClaim = mining.lastClaimTime == 0 || block.timestamp >= mining.lastClaimTime + 1 days;
    }
    
    /**
     * @dev Update conversion rates (only owner)
     */
    function updateRates(uint256 newEthRate, uint256 newUsdtRate) external onlyOwner {
        ethToSbcRate = newEthRate;
        usdtToSbcRate = newUsdtRate;
        
        emit RatesUpdated(newEthRate, newUsdtRate);
    }
    
    /**
     * @dev Update mining plan (only owner)
     */
    function updateMiningPlan(
        PlanType planType,
        uint256 deposit,
        uint256 dailyReward,
        uint256 duration,
        bool autoTrigger
    ) external onlyOwner {
        miningPlans[planType] = MiningPlan({
            deposit: deposit,
            dailyReward: dailyReward,
            duration: duration,
            autoTrigger: autoTrigger
        });
        
        emit PlanUpdated(planType, deposit, dailyReward, duration, autoTrigger);
    }
    
    /**
     * @dev Add/remove authorized minter (only owner)
     */
    function setAuthorizedMinter(address minter, bool authorized) external onlyOwner {
        authorizedMinters[minter] = authorized;
    }
    
    /**
     * @dev Update USDT token contract (only owner)
     */
    function setUSDTToken(address newUsdtToken) external onlyOwner {
        usdtToken = IERC20(newUsdtToken);
    }
    
    /**
     * @dev Withdraw ETH (only owner)
     */
    function withdrawETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "ETH withdrawal failed");
    }
    
    /**
     * @dev Withdraw USDT (only owner)
     */
    function withdrawUSDT() external onlyOwner {
        uint256 balance = usdtToken.balanceOf(address(this));
        require(balance > 0, "No USDT to withdraw");
        
        require(usdtToken.transfer(owner(), balance), "USDT withdrawal failed");
    }
    
    /**
     * @dev Emergency withdrawal of any ERC20 token (only owner)
     */
    function emergencyWithdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }
}