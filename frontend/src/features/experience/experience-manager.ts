import { ExperienceAmount } from '../../contracts/abis';
import { addGlobalExperience } from './experience-addition';
import { getGlobalExperience } from './experience-tracking';
import { LogManager } from '../../utils/log-manager';
import { AppState } from '../../state/state-store';

export class ExperienceButtonManager {
    private logManager: LogManager;
    private appState: AppState;
    private isProcessing: boolean = false;

    constructor() {
        this.logManager = LogManager.getInstance();
        this.appState = AppState.getInstance();
        this.initializeExperienceButtons();
    }

    private initializeExperienceButtons() {
        const buttons = [
            { id: 'ShapeXpWorldAbtn', type: ExperienceAmount.LOW },
            { id: 'ShapeXpWorldBbtn', type: ExperienceAmount.MID },
            { id: 'ShapeXpWorldCbtn', type: ExperienceAmount.HIGH }
        ];

        buttons.forEach(({ id, type }) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', () => this.handleExperienceAdd(type));
            }
        });
    }

    private async handleExperienceAdd(expType: ExperienceAmount) {
        if (this.isProcessing) {
            console.log('Experience addition already in progress');
            return;
        }

        try {
            this.isProcessing = true;
            this.updateButtonStates(true);
            this.logManager.updateExperienceStatus('start');

            // Add experience
            await addGlobalExperience(expType);

            // Update experience display after successful addition
            const { experience, formattedExperience } = await getGlobalExperience();
            this.appState.updateExperience(experience, formattedExperience);

            this.logManager.updateExperienceStatus('success');

        } catch (error: any) {
            console.error('Experience addition failed:', error);
            this.logManager.updateExperienceStatus('failed', error.message);

        } finally {
            this.isProcessing = false;
            this.updateButtonStates(false);
        }
    }

    private updateButtonStates(disabled: boolean) {
        const buttons = [
            'ShapeXpWorldAbtn',
            'ShapeXpWorldBbtn',
            'ShapeXpWorldCbtn'
        ];

        buttons.forEach(id => {
            const button = document.getElementById(id);
            if (button) {
                if (disabled) {
                    button.setAttribute('disabled', 'true');
                } else {
                    button.removeAttribute('disabled');
                }
            }
        });
    }
}
