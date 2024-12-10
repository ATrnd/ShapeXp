// src/features/inventory-management.ts
import { getShapeXpContract } from '../../contracts/contract-instances';
import { getCurrentAddress } from '../../utils/provider';
import { NETWORKS } from '../../network/network-config';
import { getNFTExperience } from '../nft/nft-experience';
import { ExperienceManager, TRANSFER_EXPERIENCE_AMOUNT } from '../experience/experience-transfer';
import { addNFTExperience } from '../nft/nft-experience-addition';
import { MAX_ADDITION_PER_TURN } from '../experience/experience-transfer';

// Define enhanced types for inventory
interface InventorySlot {
    nftContract: string;
    tokenId: string;
    isEmpty: boolean;
    metadata?: {
        name?: string;
        imageUrl?: string;
    };
    experience?: string;
}

interface InventoryData {
    slots: InventorySlot[];
    totalSlots: number;
}

async function fetchNFTMetadata(contractAddress: string, tokenId: string) {
    try {
        const baseURL = NETWORKS.SHAPE_SEPOLIA.rpcUrl + import.meta.env.VITE_ALCHEMY_API_KEY;
        const endpoint = `${baseURL}/getNFTMetadata?contractAddress=${contractAddress}&tokenId=${tokenId}`;

        const response = await fetch(endpoint, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch NFT metadata');
        }

        const data = await response.json();

        // Process IPFS URLs
        let imageUrl = data.metadata?.image || '';
        if (imageUrl.startsWith('ipfs://')) {
            imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
        }

        return {
            name: data.metadata?.name || data.title || 'Unnamed NFT',
            imageUrl: imageUrl
        };
    } catch (error) {
        console.error('Error fetching NFT metadata:', error);
        return null;
    }
}

export async function fetchInventory(): Promise<InventoryData> {
    try {
        const contract = await getShapeXpContract();
        const userAddress = await getCurrentAddress();

        // Get inventory slots from contract
        const [nftContracts, tokenIds] = await contract.viewInventory(userAddress);

        // Process slots and fetch metadata for non-empty slots
        const slots: InventorySlot[] = await Promise.all(
            nftContracts.map(async (contract: string, index: number) => {
                const isEmpty = contract === '0x0000000000000000000000000000000000000000';

                if (isEmpty) {
                    return {
                        nftContract: contract,
                        tokenId: tokenIds[index].toString(),
                        isEmpty: true
                    };
                }

                // Fetch complete slot data including experience
                return await fetchSlotData({
                    nftContract: contract,
                    tokenId: tokenIds[index].toString(),
                    isEmpty: false
                });
            })
        );

        return {
            slots,
            totalSlots: 3
        };

    } catch (error: any) {
        console.error('Error fetching inventory:', error);
        throw new Error(`Failed to fetch inventory: ${error.message}`);
    }
}

async function fetchSlotData(slot: InventorySlot): Promise<InventorySlot> {
    if (slot.isEmpty) return slot;

    // Fetch metadata and experience in parallel
    const [metadataResult, experienceResult] = await Promise.all([
        fetchNFTMetadata(slot.nftContract, slot.tokenId),
        getNFTExperience(slot.nftContract, slot.tokenId)
    ]);

    return {
        ...slot,
        metadata: metadataResult || undefined,
        experience: experienceResult.experience // Use the actual experience from blockchain
    };
}

function setupExperienceControls(container: HTMLElement, expManager: ExperienceManager) {
    const slots = container.querySelectorAll('.inventory-slot.occupied');

    slots.forEach(slot => {

        // Get required elements
        const contractAddress = slot.getAttribute('data-contract-address')!;
        const tokenId = slot.getAttribute('data-token-id')!;
        const plusBtn = slot.querySelector('.exp-button.plus') as HTMLButtonElement;
        const minusBtn = slot.querySelector('.exp-button.minus') as HTMLButtonElement;
        const expText = slot.querySelector('.experience-text') as HTMLElement;
        const transferBtn = slot.querySelector('.transfer-exp-button') as HTMLButtonElement;
        const transferStatus = slot.querySelector('.transfer-status') as HTMLElement;
        const globalExpDisplay = document.getElementById('experience-display')!;

        // Initialize experience tracking
        const currentExp = parseInt(expText.textContent?.split(':')[1].trim() || '0');
        expManager.initializeSlot(contractAddress, tokenId, currentExp);

        // Plus button handler (local experience)
        plusBtn.addEventListener('click', () => {
            if (expManager.addExperienceToSlot(contractAddress, tokenId)) {
                updateLocalExperienceDisplays();
            }
        });

        // Minus button handler (local experience)
        minusBtn.addEventListener('click', () => {
            if (expManager.subtractExperienceFromSlot(contractAddress, tokenId)) {
                updateLocalExperienceDisplays();
            }
        });

        // Transfer button handler (blockchain)
        transferBtn.addEventListener('click', async () => {
            transferBtn.disabled = true;
            transferStatus.textContent = 'Transferring experience...';
            transferStatus.className = 'transfer-status pending';

            try {
                const result = await addNFTExperience(contractAddress, tokenId);

                if (result.success) {
                    transferStatus.textContent = 'Experience transferred successfully!';
                    transferStatus.className = 'transfer-status success';

                    await new Promise(resolve => setTimeout(resolve, 2000));
                    await updateBlockchainExperienceDisplays();
                } else {
                    transferStatus.textContent = result.error || 'Transfer failed';
                    transferStatus.className = 'transfer-status error';
                }
            } catch (error: any) {
                console.error('Transfer error:', error);
                transferStatus.textContent = error.message || 'Transfer failed';
                transferStatus.className = 'transfer-status error';
            } finally {
                transferBtn.disabled = false;
            }
        });

        // Function to update button states
        function updateButtonStates() {
            const globalExp = expManager.getGlobalExperience();
            const slotExp = expManager.getSlotExperience(contractAddress, tokenId);
            const blockchainExp = expManager.getBlockchainExperience(contractAddress, tokenId);
            const pendingAddition = expManager.getPendingAddition(contractAddress, tokenId);

            // Plus button is disabled if:
            // 1. Not enough global experience
            // 2. Already added maximum amount this turn
            plusBtn.disabled =
                globalExp < TRANSFER_EXPERIENCE_AMOUNT ||
                pendingAddition >= MAX_ADDITION_PER_TURN;

            // Minus button is disabled if:
            // 1. Current experience is at or below blockchain experience
            // 2. Current experience is less than transfer amount
            minusBtn.disabled =
                slotExp <= blockchainExp ||
                slotExp < TRANSFER_EXPERIENCE_AMOUNT;

            // Add tooltips for better UX
            plusBtn.title = plusBtn.disabled ?
                (pendingAddition >= MAX_ADDITION_PER_TURN ?
                    'Maximum addition reached for this turn' :
                    'Not enough global experience') :
                'Add experience';

            minusBtn.title = minusBtn.disabled ?
                'Cannot reduce below blockchain experience' :
                'Remove experience';
        }

        // Function to update local experience displays
        function updateLocalExperienceDisplays() {
            const globalExp = expManager.getGlobalExperience();
            const slotExp = expManager.getSlotExperience(contractAddress, tokenId);

            // Update global experience display
            globalExpDisplay.textContent = `Global XP: ${globalExp}`;

            // Update slot experience display
            expText.textContent = `XP: ${slotExp}`;

            // Update progress bar
            const bar = slot.querySelector('.experience-bar') as HTMLElement;
            bar.style.setProperty('--percent',
                `${calculateExperiencePercentage(slotExp.toString())}%`);

            // Update button states
            updateButtonStates();
        }

        // Function to update experience from blockchain
        // After successful blockchain transfer
        async function updateBlockchainExperienceDisplays() {
            try {
                const { experience: nftExperience } = await getNFTExperience(
                    contractAddress,
                    tokenId
                );

                // Reset and reinitialize with new blockchain data
                expManager.initializeSlot(
                    contractAddress,
                    tokenId,
                    parseInt(nftExperience),
                    parseInt(nftExperience)
                );

                // Reset pending additions after successful transfer
                expManager.resetPendingAdditions(contractAddress, tokenId);

                // Update displays
                updateLocalExperienceDisplays();

            } catch (error) {
                console.error('Error updating blockchain experience:', error);
            }
        }

        // Initial button state update
        updateButtonStates();
    });
}

function calculateExperiencePercentage(experience?: string): number {
    if (!experience) return 0;
    const MAX_EXPERIENCE = 100000; // Maximum experience from contract
    return Math.min((Number(experience) / MAX_EXPERIENCE) * 100, 100);
}

function shortenAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

