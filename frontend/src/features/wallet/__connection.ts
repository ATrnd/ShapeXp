import { getCurrentAddress, getProvider } from '../../utils/provider';
import { checkShapeXpNFTOwnership } from '../nft/validation';
import { mintShapeXpNFT } from '../nft/minting';
import { getGlobalExperience } from '../experience/experience-tracking';
import { worldExperienceManager } from '../experience/world-xp-manager';
import { ConfigManager } from '../config/ConfigManager';
import { LogManager } from '../../utils/log-manager';
import { LogType, LOGS } from '../../constants';

export class WalletConnection {
    private logManager: LogManager;
    private worldExperienceManager: worldExperienceManager | null = null;
    private configManager: ConfigManager | null = null;
    constructor() {
        this.logManager = LogManager.getInstance();
        this.initializeConnection();
        this.checkExistingConnection();
        this.setupEventListeners();
        this.setupMintButton();
    }

    private async setupMintButton() {
        const mintButton = document.getElementById('ShapeXpMintButton') as HTMLButtonElement;
        const configButton = document.getElementById('ShapeXpConfigButton') as HTMLButtonElement;
        const noticeSection = document.getElementById('ShapeXpNoticeSection');
        const titleSection = document.getElementById('ShapeXpTitleSection');
        const logManager = LogManager.getInstance();

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

                // Show minting state
                logManager.showStarting(LogType.MINT);

                const tx = await mintShapeXpNFT();
                console.log('Mint transaction sent:', tx.hash);

                console.log('Waiting for transaction confirmation...');
                await tx.wait();
                console.log('Mint transaction confirmed!');

                // Show success state
                logManager.showSuccess(LogType.MINT);

                // Check NFT ownership after minting
                const hasNFT = await checkShapeXpNFTOwnership();

                if (hasNFT) {
                    try {
                        // Fetch and update global experience
                        const { formattedExperience } = await getGlobalExperience();
                        if (titleSection) {
                            titleSection.textContent = `xp available :: ${formattedExperience}`;
                        }

                        // Update UI elements
                        mintButton.style.display = 'none';
                        if (configButton) {
                            configButton.style.display = 'block';
                        }
                        if (noticeSection) {
                            noticeSection.style.display = 'none';
                        }

                        // Initialize experience manager and config manager if needed
                        if (!this.worldExperienceManager) {
                            this.worldExperienceManager = new worldExperienceManager(
                                () => this.updateExperienceDisplay()
                            );
                        }

                        if (!this.configManager) {
                            this.configManager = new ConfigManager();
                        }

                    } catch (error) {
                        console.log('Error updating experience display:', error);
                    }
                }

            } catch (error: any) {
                console.log('Minting error:', error.message || 'Failed to mint');
                logManager.showError(LogType.MINT, error.message);
                mintButton.disabled = false;
                mintButton.textContent = 'Claim ShapeXP';
            }
        });
    }


    // private async setupMintButton() {
    //     const mintButton = document.getElementById('ShapeXpMintButton') as HTMLButtonElement;
    //     if (!mintButton) {
    //         console.log('Mint button not found');
    //         return;
    //     }

    //     mintButton.addEventListener('click', async () => {
    //         try {
    //             if (!window.ethereum) {
    //                 console.log('MetaMask not installed');
    //                 return;
    //             }

    //             console.log('Starting mint process...');
    //             mintButton.disabled = true;
    //             mintButton.textContent = 'Minting...';

    //             // Show minting state
    //             this.logManager.showMintStarting();

    //             const tx = await mintShapeXpNFT();
    //             console.log('Mint transaction sent:', tx.hash);

    //             console.log('Waiting for transaction confirmation...');
    //             await tx.wait();
    //             console.log('Mint transaction confirmed!');

    //             // Show success state
    //             this.logManager.showMintCompleted();

    //             // Check NFT ownership again after minting
    //             const hasNFT = await checkShapeXpNFTOwnership();

    //             // Update UI based on successful mint
    //             if (hasNFT) {
    //                 mintButton.style.display = 'none';
    //                 const nftMessage = document.querySelector('.orbitron-regular.text-lg');
    //                 if (nftMessage) {
    //                     nftMessage.textContent = 'You now have access to all ShapeXP features!';
    //                 }
    //             }

    //         } catch (error: any) {
    //             console.log('Minting error:', error.message || 'Failed to mint');
    //             mintButton.disabled = false;
    //             mintButton.textContent = 'Claim ShapeXP';
    //         }
    //     });
    // }

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
                    this.logManager.showStarting(LogType.CONNECTION);
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
        const configPage = document.getElementById('config-page');

        accessPage?.classList.remove('active');
        configPage?.classList.remove('active');
        landingPage?.classList.add('active');

        this.logManager.showError(LogType.CONNECTION, 'Disconnected');
    }

    private async initializeConnection() {
        const connectButton = document.getElementById('connect-wallet');
        if (!connectButton) return;

        connectButton.addEventListener('click', async () => {
            try {
                this.logManager.showStarting(LogType.CONNECTION);
                console.log('Connecting wallet...');
                const address = await getCurrentAddress();
                console.log('Connected to wallet:', address);

                const hasNFT = await checkShapeXpNFTOwnership();
                this.logManager.showSuccess(LogType.CONNECTION);

                this.transitionToAccess(hasNFT);
            } catch (error: any) {
                console.log('Connection error:', error.message || 'Failed to connect');
                this.logManager.showError(LogType.CONNECTION, error.message);
            }
        });
    }

    private async updateExperienceDisplay() {
        const titleSection = document.getElementById('ShapeXpTitleSection');
        if (titleSection) {
            try {
                console.log('Updating global experience...');
                const { formattedExperience } = await getGlobalExperience();
                titleSection.textContent = `xp available :: ${formattedExperience}`;
                console.log('Global experience updated:', formattedExperience);
            } catch (error) {
                console.log('Error updating global experience:', error);
            }
        }
    }

    private async transitionToAccess(hasNFT: boolean) {

        const landingPage = document.getElementById('landing-page');
        const accessPage = document.getElementById('access-page');
        const titleSection = document.getElementById('ShapeXpTitleSection');
        const mintButton = document.getElementById('ShapeXpMintButton');
        const configButton = document.getElementById('ShapeXpConfigButton');
        const noticeSection = document.getElementById('ShapeXpNoticeSection');

        // Transition from landing to access page
        landingPage?.classList.remove('active');
        accessPage?.classList.add('active');

        if (hasNFT) {
            // User has ShapeXP NFT
            try {
                // Update experience display
                await this.updateExperienceDisplay();

                // Show config button, hide others
                if (configButton) configButton.style.display = 'block';
                if (mintButton) mintButton.style.display = 'none';
                if (noticeSection) noticeSection.style.display = 'none';

                // Initialize managers
                if (!this.configManager) {
                    this.configManager = new ConfigManager();
                    await this.configManager.refreshAll();
                }

                if (!this.worldExperienceManager) {
                    this.worldExperienceManager = new worldExperienceManager(
                        () => this.updateExperienceDisplay()
                    );
                }
            } catch (error) {
                console.log('Error initializing ShapeXP features:', error);
            }
        } else {
            // User doesn't have ShapeXP NFT
            console.log('User does not have ShapeXP NFT');

            // Reset experience display
            if (titleSection) titleSection.textContent = 'xp available :: 0';

            // Show mint button and notice, hide config button
            if (mintButton) mintButton.style.display = 'block';
            if (configButton) configButton.style.display = 'none';
            if (noticeSection) noticeSection.style.display = 'block';
        }
    }

    // private async transitionToAccess(hasNFT: boolean) {
    //     const landingPage = document.getElementById('landing-page');
    //     const accessPage = document.getElementById('access-page');
    //     const titleSection = document.getElementById('ShapeXpTitleSection');
    //     const noticeSection = document.getElementById('ShapeXpNoticeSection');
    //     const ShapeXpMintButton = document.getElementById('ShapeXpMintButton');
    //     const ShapeXpConfigButton = document.getElementById('ShapeXpConfigButton');

    //     landingPage?.classList.remove('active');
    //     accessPage?.classList.add('active');
    //     console.log(titleSection);

    //     if(!hasNFT && ShapeXpConfigButton) {
    //         ShapeXpConfigButton.style.display = 'none';
    //     }

    //     if (hasNFT && titleSection && ShapeXpMintButton) {
    //         try {

    //             await this.updateExperienceDisplay();

    //             console.log('Fetching global experience...');
    //             const { formattedExperience } = await getGlobalExperience();
    //             titleSection.textContent = `xp available :: ${formattedExperience}`;
    //             console.log('Global experience updated:', formattedExperience);

    //             if(ShapeXpConfigButton) {
    //                 ShapeXpConfigButton.style.display = 'block';
    //             }

    //             if (noticeSection && ShapeXpMintButton) {
    //                 noticeSection.style.display = 'none';
    //                 ShapeXpMintButton.style.display = 'none';
    //             }

    //             if (!this.configManager) {
    //                 this.configManager = new ConfigManager();
    //             }

    //             if (!this.worldExperienceManager) {
    //                 this.worldExperienceManager = new worldExperienceManager(
    //                     () => this.updateExperienceDisplay()
    //                 );
    //             }

    //         } catch (error) {
    //             console.log('Error fetching global experience:', error);
    //         }
    //     }
    // }
}
