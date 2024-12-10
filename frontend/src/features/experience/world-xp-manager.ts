import { ExperienceAmount } from '../../contracts/abis';
import { addGlobalExperience } from './add-experience';
import { EXPERIENCE } from '../../constants';

export class worldExperienceManager {
    private worldButtons: Record<string, { id: string; expType: ExperienceAmount }>;
    private onExperienceUpdate: () => Promise<void>;

    constructor(onExperienceUpdate: () => Promise<void>) {
        this.worldButtons = {
            'ShapeXpWorldAbtn': { id: 'ShapeXpWorldAbtn', expType: EXPERIENCE.TYPES.LOW },
            'ShapeXpWorldBbtn': { id: 'ShapeXpWorldBbtn', expType: EXPERIENCE.TYPES.MID },
            'ShapeXpWorldCbtn': { id: 'ShapeXpWorldCbtn', expType: EXPERIENCE.TYPES.HIGH }
        };

        this.onExperienceUpdate = onExperienceUpdate;
        this.initializeWorldButtons();
    }

    private initializeWorldButtons() {
        Object.values(this.worldButtons).forEach(({ id, expType }) => {
            const button = document.getElementById(id) as HTMLButtonElement;
            if (button) {
                button.addEventListener('click', async () => {
                    try {
                        console.log(`Adding experience for world with type: ${ExperienceAmount[expType]}`);
                        button.disabled = true;

                        const tx = await addGlobalExperience(expType);
                        console.log('Experience transaction sent:', tx.hash);

                        await tx.wait();
                        console.log('Experience transaction confirmed!');

                        await this.onExperienceUpdate();

                    } catch (error: any) {
                        console.log('Error adding experience:', error.message);
                    } finally {
                        button.disabled = false;
                    }
                });
            }
        });
    }
}
