import { getGlobalExperience } from '../experience/experience-tracking';

export class ConfigManager {
    constructor() {
        this.initializeConfigButton();
        this.initializeBackButton();
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
