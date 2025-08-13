import React, { useState, useEffect } from "react";
import {
	Box,
	Button,
	Card,
	VStack,
	HStack,
	Text,
	Badge,
	Heading,
	SimpleGrid,
	Stat,
	Code,
	Dialog,
} from "@chakra-ui/react";
import {
	FaCog,
	FaCoins,
	FaExchangeAlt,
	FaShieldAlt,
	FaWallet,
	FaDownload,
	FaPlay,
	FaPause,
} from "react-icons/fa";
import { useWeb3 } from "../../../../hooks/useWeb3";
import { toaster } from "../../../../components/ui/toaster";
import AlertNotification from "../../AlertNotification/AlertNotification";
import AddMinterModal from "./AddMinterModal";
import UpdateRatesModal from "./UpdateRatesModal";
import UpdateMiningPlanModal from "./UpdateMiningPlanModal";

const ContractManager = () => {
	const { isConnected, address } = useWeb3();
	const [contractData, setContractData] = useState({
		address: "0x", // Will be updated when contract is deployed
		owner: "",
		totalSupply: 0,
		ethToSabiRate: 1000,
		usdtToSabiRate: 1,
		isPaused: false,
		maxSupply: 1000000000,
	});

	const [miningPlans, setMiningPlans] = useState({
		FREE: { deposit: 0, dailyReward: 0.9, duration: 1, autoTrigger: false },
		BASIC: {
			deposit: 100,
			dailyReward: 15,
			duration: 30,
			autoTrigger: false,
		},
		PREMIUM: {
			deposit: 1000,
			dailyReward: 170,
			duration: 30,
			autoTrigger: true,
		},
	});

	const [authorizedMinters, setAuthorizedMinters] = useState([]);
	const [newMinter, setNewMinter] = useState("");
	const [newRates, setNewRates] = useState({ eth: 1000, usdt: 1 });
	const [isLoading, setIsLoading] = useState(false);

	// Modals Popup
	const [openMinterModal, setOpenMinterModal] = useState(false);
	const [openUpdateRateModal, setOpenUpdateRateModal] = useState(false);
	const [openUpdatePlanModal, setOpenUpdatePlanModal] = useState(false);

	// Selected plan for editing
	const [selectedPlan, setSelectedPlan] = useState(null);
	const [planForm, setPlanForm] = useState({
		deposit: 0,
		dailyReward: 0,
		duration: 1,
		autoTrigger: false,
	});

	useEffect(() => {
		// Initialize with mock data - in real app, fetch from contract
		setContractData({
			address: "0x1234567890123456789012345678901234567890",
			owner: address || "0x0000000000000000000000000000000000000000",
			totalSupply: 500000,
			ethToSabiRate: 1000,
			usdtToSabiRate: 1,
			isPaused: false,
			maxSupply: 1000000000,
		});

		setAuthorizedMinters([
			address || "0x0000000000000000000000000000000000000000",
			"0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
			"0x1111222233334444555566667777888899990000",
		]);
	}, [address]);

	const handleUpdateRates = async () => {
		setIsLoading(true);
		try {
			// TODO: Call smart contract updateRates function
			// await contract.updateRates(newRates.eth, newRates.usdt);

			setContractData((prev) => ({
				...prev,
				ethToSabiRate: newRates.eth,
				usdtToSabiRate: newRates.usdt,
			}));

			toaster.create({
				title: "Rates Updated",
				description: `ETH rate: ${newRates.eth}, USDT rate: ${newRates.usdt}`,
				type: "success",
				duration: 3000,
			});
			setOpenUpdateRateModal(false);
		} catch (error) {
			toaster.create({
				title: "Error",
				description: "Failed to update rates. Please try again.",
				type: "error",
				duration: 3000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleUpdateMiningPlan = async () => {
		if (!selectedPlan) return;

		setIsLoading(true);
		try {
			// TODO: Call smart contract updateMiningPlan function
			setMiningPlans((prev) => ({
				...prev,
				[selectedPlan]: planForm,
			}));

			toaster.create({
				title: "Mining Plan Updated",
				description: `${selectedPlan} plan has been updated successfully`,
				type: "success",
				duration: 3000,
			});
			setOpenUpdatePlanModal(false);
		} catch (error) {
			toaster.create({
				title: "Error",
				description: "Failed to update mining plan. Please try again.",
				type: "error",
				duration: 3000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleAddMinter = async () => {
		if (
			!newMinter ||
			!newMinter.startsWith("0x") ||
			newMinter.length !== 42
		) {
			toaster.create({
				title: "Invalid Address",
				description: "Please enter a valid Ethereum address",
				type: "error",
				duration: 3000,
			});
			return;
		}

		setIsLoading(true);
		try {
			// TODO: Call smart contract setAuthorizedMinter function
			setAuthorizedMinters((prev) => [...prev, newMinter]);
			setNewMinter("");

			toaster.create({
				title: "Minter Added",
				description: "Authorized minter added successfully",
				type: "success",
				duration: 3000,
			});
			setOpenMinterModal(false);
		} catch (error) {
			toaster.create({
				title: "Error",
				description: "Failed to add authorized minter. Please try again.",
				type: "error",
				duration: 3000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleRemoveMinter = async (minterAddress) => {
		try {
			// TODO: Call smart contract setAuthorizedMinter(address, false) function
			setAuthorizedMinters((prev) =>
				prev.filter((m) => m !== minterAddress)
			);

			toaster.create({
				title: "Minter Removed",
				description: "Authorized minter removed successfully",
				type: "info",
				duration: 3000,
			});
		} catch (error) {
			toaster.create({
				title: "Error",
				description:
					"Failed to remove authorized minter. Please try again.",
				type: "error",
				duration: 3000,
			});
		}
	};

	const handlePauseContract = async () => {
		try {
			// TODO: Call smart contract pause/unpause function
			setContractData((prev) => ({
				...prev,
				isPaused: !prev.isPaused,
			}));

			toaster.create({
				title: `Contract ${contractData.isPaused ? "Unpaused" : "Paused"}`,
				description: `Smart contract has been ${
					contractData.isPaused ? "unpaused" : "paused"
				}`,
				type: "success",
				duration: 3000,
			});
		} catch (error) {
			toaster.create({
				title: "Error",
				description: "Failed to change contract status. Please try again.",
				type: "error",
				duration: 3000,
			});
		}
	};

	const handleWithdrawFunds = async (tokenType) => {
		try {
			// TODO: Call smart contract withdraw functions
			toaster.create({
				title: "Withdrawal Initiated",
				description: `${tokenType} withdrawal has been initiated`,
				status: "success",
				duration: 3000,
			});
		} catch (error) {
			toaster.create({
				title: "Error",
				description: "Failed to withdraw funds. Please try again.",
				status: "error",
				duration: 3000,
			});
		}
	};

	const openPlanModal = (planName) => {
		setSelectedPlan(planName);
		setPlanForm(miningPlans[planName]);
		setOpenUpdatePlanModal(true);
	};

	if (!isConnected) {
		return (
			<AlertNotification
				status={"warning"}
				alertMsg={
					" Please connect your wallet to access contract management features"
				}
			/>
		);
	}

	return (
		<VStack gap={6} align="stretch">
			{/* Contract Overview */}
			<SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
				<Card.Root>
					<Card.Body>
						<Stat.Root>
							<Stat.Label>Contract Address</Stat.Label>
							<Stat.ValueText fontSize="sm">
								{contractData.address.slice(0, 10)}...
							</Stat.ValueText>
							<Stat.HelpText>Polygon zkEVM</Stat.HelpText>
						</Stat.Root>
					</Card.Body>
				</Card.Root>

				<Card.Root>
					<Card.Body>
						<Stat.Root>
							<Stat.Label>Total Supply</Stat.Label>
							<Stat.ValueText>
								{contractData.totalSupply.toLocaleString()}
							</Stat.ValueText>
							<Stat.HelpText>SABI tokens</Stat.HelpText>
						</Stat.Root>
					</Card.Body>
				</Card.Root>

				<Card.Root>
					<Card.Body>
						<Stat.Root>
							<Stat.Label>Max Supply</Stat.Label>
							<Stat.ValueText>
								{contractData.maxSupply.toLocaleString()}
							</Stat.ValueText>
							<Stat.HelpText>Token limit</Stat.HelpText>
						</Stat.Root>
					</Card.Body>
				</Card.Root>

				<Card.Root>
					<Card.Body>
						<Stat.Root>
							<Stat.Label>Contract Status</Stat.Label>
							<Stat.ValueText>
								<Badge
									colorPalette={
										contractData.isPaused ? "red" : "green"
									}
								>
									{contractData.isPaused ? "Paused" : "Active"}
								</Badge>
							</Stat.ValueText>
							<Stat.HelpText>Current state</Stat.HelpText>
						</Stat.Root>
					</Card.Body>
				</Card.Root>
			</SimpleGrid>

			{/* Quick Actions */}
			<Card.Root p={2}>
				<Card.Body p={2}>
					<VStack gap={4}>
						<Heading size="lg" alignSelf={`start`}>
							Quick Actions
						</Heading>
						<SimpleGrid columns={{ base: 2, md: 4 }} gap={2} w="full">
							<UpdateRatesModal
								handleUpdateRates={handleUpdateRates}
								isLoading={isLoading}
								newRates={newRates}
								setNewRates={setNewRates}
								openUpdateRateModal={openUpdateRateModal}
								setOpenUpdateRateModal={setOpenUpdateRateModal}
							>
								<Dialog.Trigger>
									<Button
										colorPalette="blue"
										w={`full`}
										fontSize={{ base: 14, md: `initial` }}
									>
										<FaExchangeAlt /> Update Rates
									</Button>
								</Dialog.Trigger>
							</UpdateRatesModal>

							{/* Edit Only Free Mining Plan */}
							<UpdateMiningPlanModal
								handleUpdateMiningPlan={handleUpdateMiningPlan}
								isLoading={isLoading}
								planForm={planForm}
								selectedPlan={selectedPlan}
								setPlanForm={setPlanForm}
								openUpdatePlanModal={openUpdatePlanModal}
								setOpenUpdatePlanModal={setOpenUpdatePlanModal}
							>
								<Dialog.Trigger>
									<Button
										colorPalette="purple"
										w={`full`}
										fontSize={{ base: 14, md: `initial` }}
										onClick={() => openPlanModal("FREE")}
									>
										<FaCoins /> Edit Mining Plans
									</Button>
								</Dialog.Trigger>
							</UpdateMiningPlanModal>

							<Button
								colorPalette="orange"
								w={`full`}
								fontSize={{ base: 14, md: `initial` }}
							>
								<FaShieldAlt /> Manage Minters
							</Button>

							<Button
								fontSize={{ base: 14, md: `initial` }}
								colorPalette={contractData.isPaused ? "green" : "red"}
								onClick={handlePauseContract}
							>
								{contractData.isPaused ? <FaPlay /> : <FaPause />}{" "}
								{contractData.isPaused ? "Unpause" : "Pause"} Contract
							</Button>
						</SimpleGrid>
					</VStack>
				</Card.Body>
			</Card.Root>

			{/* Conversion Rates */}
			<Card.Root>
				<Card.Body>
					<VStack gap={4} align="stretch">
						<Heading size="md">Current Conversion Rates</Heading>
						<SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
							<Box
								p={4}
								border="1px solid"
								borderColor="gray.200"
								rounded="lg"
							>
								<HStack justify="space-between">
									<Text fontWeight="600">ETH to SABI:</Text>
									<Text color={`gray.600`}>
										1 ETH = {contractData.ethToSabiRate} SABI
									</Text>
								</HStack>
							</Box>
							<Box
								p={4}
								border="1px solid"
								borderColor="gray.200"
								rounded="lg"
							>
								<HStack justify="space-between">
									<Text fontWeight="600">USDT to SABI:</Text>
									<Text color={`gray.600`}>
										1 USDT = {contractData.usdtToSabiRate} SABI
									</Text>
								</HStack>
							</Box>
						</SimpleGrid>
					</VStack>
				</Card.Body>
			</Card.Root>

			{/* Mining Plans Configuration */}
			<Card.Root>
				<Card.Body>
					<VStack gap={4} align="stretch">
						<Heading size="md">Mining Plans Configuration</Heading>
						<SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
							{Object.entries(miningPlans).map(([planName, plan]) => (
								<Card.Root
									key={planName}
									border="1px solid"
									borderColor="gray.200"
								>
									<Card.Body>
										<VStack gap={3} align="stretch">
											<HStack justify="space-between">
												<Text fontWeight="bold">
													{planName} Plan
												</Text>
												<Button
													size="sm"
													onClick={() => openPlanModal(planName)}
												>
													<FaCog /> Edit
												</Button>
											</HStack>
											<Text fontSize="sm">
												Deposit: {plan.deposit} SABI
											</Text>
											<Text fontSize="sm">
												Daily Reward: {plan.dailyReward} SABI
											</Text>
											<Text fontSize="sm">
												Duration: {plan.duration} days
											</Text>
											<Text fontSize="sm">
												Auto Trigger:{" "}
												{plan.autoTrigger ? "Yes" : "No"}
											</Text>
										</VStack>
									</Card.Body>
								</Card.Root>
							))}
						</SimpleGrid>
					</VStack>
				</Card.Body>
			</Card.Root>

			{/* Authorized Minters */}
			<Card.Root>
				<Card.Body>
					<VStack gap={4} align="stretch">
						<HStack justify="space-between">
							<Heading size="md">Authorized Minters</Heading>

							<AddMinterModal
								handleAddMinter={handleAddMinter}
								isLoading={isLoading}
								newMinter={newMinter}
								setNewMinter={setNewMinter}
								setOpenMinterModal={setOpenMinterModal}
								openMinterModal={openMinterModal}
							>
								<Dialog.Trigger>
									<Button colorPalette="green">
										<FaWallet /> Add Minter
									</Button>
								</Dialog.Trigger>
							</AddMinterModal>
						</HStack>
						<VStack gap={2} align="stretch">
							{authorizedMinters.map((minter, index) => (
								<HStack
									key={index}
									justify="space-between"
									flexWrap={`wrap`}
									p={3}
									border="1px solid"
									borderColor="gray.200"
									rounded="md"
								>
									<Code
										fontSize="sm"
										textWrap={`wrap`}
										whiteSpace="pre-wrap"
										wordBreak="break-all"
										overflowWrap="break-word"
									>
										{minter}
									</Code>
									<Button
										size="sm"
										colorPalette="red"
										onClick={() => handleRemoveMinter(minter)}
									>
										Remove
									</Button>
								</HStack>
							))}
						</VStack>
					</VStack>
				</Card.Body>
			</Card.Root>

			{/* Fund Management */}
			<Card.Root>
				<Card.Body>
					<VStack gap={4} align="stretch">
						<Heading size="md">Fund Management</Heading>
						<SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
							<Button
								colorPalette="green"
								onClick={() => handleWithdrawFunds("ETH")}
							>
								<FaDownload /> Withdraw ETH
							</Button>
							<Button
								colorPalette="blue"
								onClick={() => handleWithdrawFunds("USDT")}
							>
								<FaDownload /> Withdraw USDT
							</Button>
						</SimpleGrid>
					</VStack>
				</Card.Body>
			</Card.Root>
		</VStack>
	);
};

export default ContractManager;
