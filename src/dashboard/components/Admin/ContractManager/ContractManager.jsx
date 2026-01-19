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
	FaExchangeAlt,
	FaShieldAlt,
	FaWallet,
	FaDownload,
	FaPlay,
	FaPause,
} from "react-icons/fa";
import { ethers } from "ethers";
import { useWeb3 } from "../../../../hooks/useWeb3";
import { toaster } from "../../../../components/ui/toaster";
import AlertNotification from "../../AlertNotification/AlertNotification";
import AddMinterModal from "./AddMinterModal";
import UpdateRatesModal from "./UpdateRatesModal";
import { SABI_CASH_ABI, SABI_CASH_CONTRACT_ADDRESS } from "../../../../config/web3Config";

const MINTER_ROLE = ethers.utils.id("MINTER_ROLE");

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

	const [authorizedMinters, setAuthorizedMinters] = useState([]);
	const [newMinter, setNewMinter] = useState("");
	const [newRates, setNewRates] = useState({ eth: 1000, usdt: 1 });
	const [isLoading, setIsLoading] = useState(false);

	// Modals Popup
	const [openMinterModal, setOpenMinterModal] = useState(false);
	const [openUpdateRateModal, setOpenUpdateRateModal] = useState(false);

	useEffect(() => {
		const loadContractData = async () => {
			if (!isConnected || !SABI_CASH_CONTRACT_ADDRESS) return;
			if (!window.ethereum) return;

			setIsLoading(true);
			try {
				const provider = new ethers.providers.Web3Provider(window.ethereum);
				const contract = new ethers.Contract(
					SABI_CASH_CONTRACT_ADDRESS,
					SABI_CASH_ABI,
					provider
				);

				let owner = "";
				try {
					owner = await contract.owner();
				} catch (e) {
					console.error("Failed to fetch owner:", e);
					owner = "";
				}

				let decimals = 18;
				try {
					decimals = await contract.decimals();
				} catch {
					decimals = 18;
				}

				let totalSupply = 0;
				try {
					const supply = await contract.totalSupply();
					totalSupply = Number(ethers.utils.formatUnits(supply, decimals));
				} catch {
					totalSupply = 0;
				}

				// Fetch claim conditions for rate and pause status
				let ethRate = 1000;
				let isPaused = false;
				try {
					const condition = await contract.claimCondition();
					if (condition) {
						// pricePerToken is in Wei per token. 
						// If 1 Token = 0.001 ETH, then pricePerToken = 10^15
						// Rate = 1 ETH / pricePerToken
						const price = ethers.BigNumber.from(condition.pricePerToken);
						if (price.gt(0)) {
							const oneEth = ethers.utils.parseEther("1");
							ethRate = oneEth.div(price).toNumber();
						}
						
						// Check pause status via maxClaimableSupply or timestamp
						// If startTimestamp is in future, effectively paused for public
						const now = Math.floor(Date.now() / 1000);
						const start = ethers.BigNumber.from(condition.startTimestamp).toNumber();
						const maxSupply = ethers.BigNumber.from(condition.maxClaimableSupply);
						
						isPaused = start > now || maxSupply.eq(0);
					}
				} catch {
					// Default conditions if none exist
				}

				setContractData((prev) => ({
					...prev,
					address: SABI_CASH_CONTRACT_ADDRESS,
					owner: owner || prev.owner,
					totalSupply,
					ethToSabiRate: ethRate,
					isPaused,
				}));

				// Minters are hard to fetch without events, so we start empty
				setAuthorizedMinters([]);
			} catch {
				toaster.create({
					title: "Error",
					description: "Failed to load contract data from chain.",
					type: "error",
					duration: 4000,
				});
			} finally {
				setIsLoading(false);
			}
		};

		loadContractData();
	}, [isConnected, address]);

	const handleUpdateRates = async () => {
		setIsLoading(true);
		try {
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();
			const contract = new ethers.Contract(
				SABI_CASH_CONTRACT_ADDRESS,
				SABI_CASH_ABI,
				signer
			);

			// Calculate new pricePerToken: 1 ETH / Rate
			// e.g. Rate = 1000 SABI/ETH => Price = 0.001 ETH/SABI
			const oneEth = ethers.utils.parseEther("1");
			const pricePerToken = oneEth.div(newRates.eth);

			// Preserve existing conditions but update price
			let currentCondition;
			try {
				currentCondition = await contract.claimCondition();
			} catch {
				// Default conditions if none exist
				currentCondition = {
					startTimestamp: 0,
					maxClaimableSupply: ethers.constants.MaxUint256,
					supplyClaimed: 0,
					quantityLimitPerWallet: ethers.constants.MaxUint256,
					merkleRoot: ethers.constants.HashZero,
					pricePerToken: pricePerToken,
					currency: ethers.constants.AddressZero, // Native Token
					metadata: ""
				};
			}

			const newCondition = {
				startTimestamp: currentCondition.startTimestamp,
				maxClaimableSupply: currentCondition.maxClaimableSupply,
				supplyClaimed: currentCondition.supplyClaimed,
				quantityLimitPerWallet: currentCondition.quantityLimitPerWallet,
				merkleRoot: currentCondition.merkleRoot,
				pricePerToken: pricePerToken,
				currency: currentCondition.currency,
				metadata: currentCondition.metadata
			};

			const tx = await contract.setClaimConditions(newCondition, false); // resetClaimEligibility = false
			await tx.wait();

			setContractData((prev) => ({
				...prev,
				ethToSabiRate: newRates.eth,
				// usdtToSabiRate: newRates.usdt // Cannot update USDT rate via single claim condition easily without multi-phase
			}));

			toaster.create({
				title: "Rates Updated",
				description: `ETH rate updated to: ${newRates.eth}. USDT rate requires custom contract logic.`,
				type: "success",
				duration: 3000,
			});
			setOpenUpdateRateModal(false);
		} catch (error) {
			console.error(error);
			toaster.create({
				title: "Error",
				description: "Failed to update rates on-chain.",
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
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();
			const contract = new ethers.Contract(
				SABI_CASH_CONTRACT_ADDRESS,
				SABI_CASH_ABI,
				signer
			);

			const tx = await contract.grantRole(MINTER_ROLE, newMinter);
			await tx.wait();

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
			console.error(error);
			toaster.create({
				title: "Error",
				description: "Failed to add authorized minter. Ensure you are Admin.",
				type: "error",
				duration: 3000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleRemoveMinter = async (minterAddress) => {
		try {
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();
			const contract = new ethers.Contract(
				SABI_CASH_CONTRACT_ADDRESS,
				SABI_CASH_ABI,
				signer
			);

			const tx = await contract.revokeRole(MINTER_ROLE, minterAddress);
			await tx.wait();

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
			console.error(error);
			toaster.create({
				title: "Error",
				description:
					"Failed to remove authorized minter. Ensure you are Admin.",
				type: "error",
				duration: 3000,
			});
		}
	};

	const handlePauseContract = async () => {
		try {
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();
			const contract = new ethers.Contract(
				SABI_CASH_CONTRACT_ADDRESS,
				SABI_CASH_ABI,
				signer
			);

			// Toggle pause by setting maxClaimableSupply to 0 or restoring it
			let currentCondition;
			try {
				currentCondition = await contract.claimCondition();
			} catch {
				throw new Error("Cannot fetch current conditions");
			}

			const newPausedState = !contractData.isPaused;
			const newMaxSupply = newPausedState ? 0 : ethers.constants.MaxUint256;

			const newCondition = {
				startTimestamp: currentCondition.startTimestamp,
				maxClaimableSupply: newMaxSupply,
				supplyClaimed: currentCondition.supplyClaimed,
				quantityLimitPerWallet: currentCondition.quantityLimitPerWallet,
				merkleRoot: currentCondition.merkleRoot,
				pricePerToken: currentCondition.pricePerToken,
				currency: currentCondition.currency,
				metadata: currentCondition.metadata
			};

			const tx = await contract.setClaimConditions(newCondition, false);
			await tx.wait();

			setContractData((prev) => ({
				...prev,
				isPaused: newPausedState,
			}));

			toaster.create({
				title: `Contract ${newPausedState ? "Paused" : "Unpaused"}`,
				description: `Smart contract has been ${
					newPausedState ? "paused" : "unpaused"
				}`,
				type: "success",
				duration: 3000,
			});
		} catch (error) {
			console.error(error);
			toaster.create({
				title: "Error",
				description: "Failed to change contract status.",
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
		} catch {
			toaster.create({
				title: "Error",
				description: "Failed to withdraw funds. Please try again.",
				status: "error",
				duration: 3000,
			});
		}
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
