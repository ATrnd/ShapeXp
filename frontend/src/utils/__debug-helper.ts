// src/utils/debug-helper.ts

export class StateDebugger {
    private static instance: StateDebugger;

    private constructor() {
        this.attachMutationObserver();
    }

    public static getInstance(): StateDebugger {
        if (!StateDebugger.instance) {
            StateDebugger.instance = new StateDebugger();
        }
        return StateDebugger.instance;
    }

    private attachMutationObserver() {
        // Watch for class changes on pages
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const element = mutation.target as HTMLElement;
                    console.log(`[StateDebugger] Class changed for ${element.id}:`, element.className);
                }
            });
        });

        // Observe all pages
        ['landing-page', 'access-page', 'config-page'].forEach(pageId => {
            const element = document.getElementById(pageId);
            if (element) {
                observer.observe(element, {
                    attributes: true,
                    attributeFilter: ['class']
                });
            }
        });
    }

    public logStateChange(action: string, data: any) {
        console.group(`[StateDebugger] ${action}`);
        console.log('Data:', data);
        console.log('DOM State:');
        ['landing-page', 'access-page', 'config-page'].forEach(pageId => {
            const element = document.getElementById(pageId);
            console.log(`${pageId}:`, element?.className);
        });
        console.groupEnd();
    }
}
