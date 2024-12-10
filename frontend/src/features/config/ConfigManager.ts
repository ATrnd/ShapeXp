import { getGlobalExperience } from '../experience/experience-tracking';
import { ConfigNFTManager } from './ConfigNFTManager';
import { ConfigInventoryManager } from '../inventory/config-inventory-manager';

export class ConfigManager {
    private nftManager: ConfigNFTManager | null = null;
    private inventoryManager: ConfigInventoryManager | null = null;

    constructor() {
        this.initializeConfigButton();
        this.initializeBackButton();
    }

    private setupDisconnectHandler() {
        const ethereum = window.ethereum;
        if (!ethereum?.on) {
            console.log('MetaMask not installed or ethereum.on not available');
            return;
        }

        ethereum.on('accountsChanged', (accounts: string[]) => {
            if (accounts.length === 0) {
                console.log('Wallet disconnected, returning to landing page');
                this.returnToLanding();
            }
        });
    }

    private returnToLanding() {
        const configPage = document.getElementById('config-page');
        const landingPage = document.getElementById('landing-page');

        configPage?.classList.remove('active');
        landingPage?.classList.add('active');
    }

    private initializeConfigButton() {
        const configButton = document.getElementById('ShapeXpConfigButton');
        if (configButton) {
            configButton.addEventListener('click', () => {
                this.showConfigPage();
            });
        }
    }

    private initializeBackButton() {
        const backButton = document.querySelector('button[class*="border-opacity-30"]') as HTMLButtonElement;
        if (backButton) {
            backButton.addEventListener('click', () => {
                this.hideConfigPage();
            });
        }
    }

    private async showConfigPage() {
        console.log('Showing config page');
        const accessPage = document.getElementById('access-page');
        const configPage = document.getElementById('config-page');

        accessPage?.classList.remove('active');
        configPage?.classList.add('active');

        if (!this.nftManager) {
            this.nftManager = new ConfigNFTManager();
        }
        if (!this.inventoryManager) {
            this.inventoryManager = new ConfigInventoryManager();
        }

        await this.updateXPDisplay();
    }

    private hideConfigPage() {
        console.log('Hiding config page');
        const accessPage = document.getElementById('access-page');
        const configPage = document.getElementById('config-page');

        configPage?.classList.remove('active');
        accessPage?.classList.add('active');
    }

    private async updateXPDisplay() {
        try {
            console.log('Fetching global experience for config page...');
            const { formattedExperience } = await getGlobalExperience();

            const xpDisplay = document.getElementById('ShapeXpConfigXpDisplay');
            if (xpDisplay) {
                xpDisplay.textContent = `xp available :: ${formattedExperience}`;
            }

            console.log('Config page XP updated:', formattedExperience);
        } catch (error) {
            console.log('Error updating config page XP:', error);
        }
    }
}
