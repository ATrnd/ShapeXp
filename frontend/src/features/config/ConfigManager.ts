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

    private showConfigPage() {
        console.log('Showing config page');
        const accessPage = document.getElementById('access-page');
        const configPage = document.getElementById('config-page');

        accessPage?.classList.remove('active');
        configPage?.classList.add('active');
    }

    private hideConfigPage() {
        console.log('Hiding config page');
        const accessPage = document.getElementById('access-page');
        const configPage = document.getElementById('config-page');

        configPage?.classList.remove('active');
        accessPage?.classList.add('active');
    }
}
