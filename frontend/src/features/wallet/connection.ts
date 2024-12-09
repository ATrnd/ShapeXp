import { getCurrentAddress, getProvider } from '../../utils/provider';
import { checkShapeXpNFTOwnership } from '../nft/validation';
import { mintShapeXpNFT } from '../nft/minting';
import { getGlobalExperience } from '../experience/experience-tracking';

export class WalletConnection {
    constructor() {
        this.initializeConnection();
        this.checkExistingConnection();
        this.setupEventListeners();
        this.setupMintButton();
    }

    private async setupMintButton() {
        const mintButton = document.getElementById('ShapeXpMintButton') as HTMLButtonElement;
        if (!mintButton) {
            console.log('Mint button not found');
            return;
        }

        mintButton.addEventListener('click', async () => {
            try {
                if (!window.ethereum) {
                    console.log('MetaMask not installed');
                    return;
                }

                console.log('Starting mint process...');
                mintButton.disabled = true;
                mintButton.textContent = 'Minting...';

                const tx = await mintShapeXpNFT();
                console.log('Mint transaction sent:', tx.hash);

                console.log('Waiting for transaction confirmation...');
                await tx.wait();
                console.log('Mint transaction confirmed!');

                // Check NFT ownership again after minting
                const hasNFT = await checkShapeXpNFTOwnership();

                // Update UI based on successful mint
                if (hasNFT) {
                    mintButton.style.display = 'none';
                    const nftMessage = document.querySelector('.orbitron-regular.text-lg');
                    if (nftMessage) {
                        nftMessage.textContent = 'You now have access to all ShapeXP features!';
                    }
                }

            } catch (error: any) {
                console.log('Minting error:', error.message || 'Failed to mint');
                mintButton.disabled = false;
                mintButton.textContent = 'Claim ShapeXP';
            }
        });
    }

    private async checkExistingConnection() {
        try {
            if (!window.ethereum) {
                console.log('MetaMask not installed');
                return;
            }

            const provider = await getProvider();
            const accounts = await provider.listAccounts();

            if (accounts.length > 0) {
                console.log('Existing connection found:', accounts[0].address);
                const hasNFT = await checkShapeXpNFTOwnership();
                this.transitionToAccess(hasNFT);
            } else {
                console.log('No existing connection');
            }
        } catch (error) {
            console.log('Error checking existing connection:', error);
        }
    }

    private setupEventListeners() {

        if (!window.ethereum) {
            console.log('MetaMask not installed, skipping event listeners');
            return;
        }

        const ethereum = window.ethereum;

        // Handle account changes
        if (ethereum.on) {
            ethereum.on('accountsChanged', async (accounts: string[]) => {
                if (accounts.length === 0) {
                    console.log('Disconnected from wallet');
                    this.handleDisconnect();
                } else {
                    console.log('Account changed:', accounts[0]);
                    const hasNFT = await checkShapeXpNFTOwnership();
                    this.transitionToAccess(hasNFT);
                }
            });

            // Handle chain changes
            ethereum.on('chainChanged', () => {
                console.log('Network changed, reloading...');
                window.location.reload();
            });
        }
    }

    private handleDisconnect() {
        const landingPage = document.getElementById('landing-page');
        const accessPage = document.getElementById('access-page');

        accessPage?.classList.remove('active');
        landingPage?.classList.add('active');
    }

    private async initializeConnection() {
        const connectButton = document.getElementById('connect-wallet');
        if (!connectButton) return;

        connectButton.addEventListener('click', async () => {
            try {
                console.log('Connecting wallet...');
                const address = await getCurrentAddress();
                console.log('Connected to wallet:', address);

                const hasNFT = await checkShapeXpNFTOwnership();
                console.log('NFT ownership status:', hasNFT);

                this.transitionToAccess(hasNFT);
            } catch (error: any) {
                console.log('Connection error:', error.message || 'Failed to connect');
            }
        });
    }

    private async transitionToAccess(hasNFT: boolean) {
        const landingPage = document.getElementById('landing-page');
        const accessPage = document.getElementById('access-page');
        const titleSection = document.getElementById('ShapeXpTitleSection');
        const noticeSection = document.getElementById('ShapeXpNoticeSection');
        const ShapeXpMintButton = document.getElementById('ShapeXpMintButton');
        const ShapeXpConfigButton = document.getElementById('ShapeXpConfigButton');

        landingPage?.classList.remove('active');
        accessPage?.classList.add('active');
        console.log(titleSection);

        if(!hasNFT && ShapeXpConfigButton) {
            ShapeXpConfigButton.style.display = 'none';
        }

        if (hasNFT && titleSection && ShapeXpMintButton) {
            try {
                console.log('Fetching global experience...');
                const { formattedExperience } = await getGlobalExperience();
                titleSection.textContent = `xp available :: ${formattedExperience}`;
                console.log('Global experience updated:', formattedExperience);

                if(ShapeXpConfigButton) {
                    ShapeXpConfigButton.style.display = 'block';
                }

                if (noticeSection && ShapeXpMintButton) {
                    noticeSection.style.display = 'none';
                    ShapeXpMintButton.style.display = 'none';
                }
            } catch (error) {
                console.log('Error fetching global experience:', error);
            }
        }
    }
}
