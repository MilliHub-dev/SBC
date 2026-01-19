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
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { toaster } from "../../../../components/ui/toaster";
import AlertNotification from "../../AlertNotification/AlertNotification";
import AddMinterModal from "./AddMinterModal";
import UpdateRatesModal from "./UpdateRatesModal";
import { SABI_CASH_CONTRACT_ADDRESS } from "../../../../config/web3Config";

const ContractManager = () => {
    const { connection } = useConnection();
    const { connected, publicKey } = useWallet();
    
    const [contractData, setContractData] = useState({
        address: SABI_CASH_CONTRACT_ADDRESS || "Not Set",
        owner: "Admin Treasury",
        totalSupply: 0,
        solToSabiRate: 1000, // SOL to SABI
        usdtToSabiRate: 1,
        isPaused: false,
        maxSupply: 1000000000,
    });

    const [authorizedMinters, setAuthorizedMinters] = useState([]);
    const [newMinter, setNewMinter] = useState("");
    const [newRates, setNewRates] = useState({ sol: 1000, usdt: 1 });
    const [isLoading, setIsLoading] = useState(false);

    // Modals Popup
    const [openMinterModal, setOpenMinterModal] = useState(false);
    const [openUpdateRateModal, setOpenUpdateRateModal] = useState(false);

    useEffect(() => {
        const loadContractData = async () => {
            if (!connected || !SABI_CASH_CONTRACT_ADDRESS) return;

            setIsLoading(true);
            try {
                // TODO: Fetch actual Solana SPL Token info here
                // For now, we mock the data as if we read it from chain
                
                setContractData((prev) => ({
                    ...prev,
                    address: SABI_CASH_CONTRACT_ADDRESS,
                    totalSupply: 1000000, // Mock
                    solToSabiRate: 1000,
                    isPaused: false,
                }));

                setAuthorizedMinters([publicKey?.toString()]);
            } catch (e) {
                console.error("Error loading contract data", e);
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
    }, [connected, publicKey, connection]);

    const handleUpdateRates = async () => {
        setIsLoading(true);
        try {
            // Simulate update
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setContractData((prev) => ({
                ...prev,
                solToSabiRate: newRates.sol,
            }));

            toaster.create({
                title: "Rates Updated",
                description: `SOL rate updated to: ${newRates.sol} (Simulation)`,
                type: "success",
                duration: 3000,
            });
            setOpenUpdateRateModal(false);
        } catch (error) {
            console.error(error);
            toaster.create({
                title: "Error",
                description: "Failed to update rates.",
                type: "error",
                duration: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddMinter = async () => {
        if (!newMinter) {
            toaster.create({
                title: "Invalid Address",
                description: "Please enter a valid Solana address",
                type: "error",
                duration: 3000,
            });
            return;
        }

        setIsLoading(true);
        try {
            // Simulate adding minter
            await new Promise(resolve => setTimeout(resolve, 1000));

            setAuthorizedMinters((prev) => [...prev, newMinter]);
            setNewMinter("");

            toaster.create({
                title: "Minter Added",
                description: "Authorized minter added successfully (Simulation)",
                type: "success",
                duration: 3000,
            });
            setOpenMinterModal(false);
        } catch (error) {
            console.error(error);
            toaster.create({
                title: "Error",
                description: "Failed to add authorized minter.",
                type: "error",
                duration: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveMinter = async (minterAddress) => {
        try {
            // Simulate remove
            setAuthorizedMinters((prev) =>
                prev.filter((m) => m !== minterAddress)
            );

            toaster.create({
                title: "Minter Removed",
                description: "Authorized minter removed successfully (Simulation)",
                type: "info",
                duration: 3000,
            });
        } catch (error) {
            console.error(error);
            toaster.create({
                title: "Error",
                description: "Failed to remove authorized minter.",
                type: "error",
                duration: 3000,
            });
        }
    };

    const handlePauseContract = async () => {
        try {
            const newPausedState = !contractData.isPaused;
            
            setContractData((prev) => ({
                ...prev,
                isPaused: newPausedState,
            }));

            toaster.create({
                title: `Contract ${newPausedState ? "Paused" : "Unpaused"}`,
                description: `Contract has been ${
                    newPausedState ? "paused" : "unpaused"
                } (Simulation)`,
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
            toaster.create({
                title: "Withdrawal Initiated",
                description: `${tokenType} withdrawal has been initiated (Simulation)`,
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

    if (!connected) {
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
                            <Stat.HelpText>Solana</Stat.HelpText>
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
                                    <Text fontWeight="600">SOL to SABI:</Text>
                                    <Text color={`gray.600`}>
                                        1 SOL = {contractData.solToSabiRate} SABI
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
                                onClick={() => handleWithdrawFunds("SOL")}
                            >
                                <FaDownload /> Withdraw SOL
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
