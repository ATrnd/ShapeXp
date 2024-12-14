/**
* @title Cooldown Timer System
* @notice Manages experience gain cooldown timer and display
* @dev Implements singleton pattern for global cooldown management
* @custom:module-hierarchy Core Timer Component
*/
export class CooldownTimer {

    /** @dev Singleton instance */
    private static instance: CooldownTimer;

   /** @dev Active timer interval reference */
    private timerInterval: ReturnType<typeof setInterval> | null = null;

    /** @dev DOM element for timer display */
    private cooldownElement: HTMLElement | null = null;

   /**
    * @notice Private constructor enforcing singleton pattern
    * @dev Initializes cooldown display element reference
    */
    private constructor() {
        this.cooldownElement = document.getElementById('ShapeXpCooldown');
    }

   /**
    * @notice Returns singleton instance of CooldownTimer
    * @dev Creates instance if it doesn't exist
    * @return CooldownTimer The singleton instance
    */
    public static getInstance(): CooldownTimer {
        if (!CooldownTimer.instance) {
            CooldownTimer.instance = new CooldownTimer();
        }
        return CooldownTimer.instance;
    }

   /**
    * @notice Resets the cooldown timer
    * @dev Clears interval and resets display to zero
    * @custom:flow
    * 1. Clear existing interval
    * 2. Reset interval reference
    * 3. Update display to zero
    */
    public resetTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        const cooldownElement = document.getElementById('ShapeXpCooldown');
        if (cooldownElement) {
            cooldownElement.textContent = 'xp cooldown: 0';
        }
    }

   /**
    * @notice Starts the cooldown timer
    * @dev Initializes 30-minute countdown with 1-second updates
    * @custom:timing
    * - Duration: 30 minutes
    * - Update Interval: 1 second
    * - Display Format: "Xm Ys"
    * @custom:flow
    * 1. Clear any existing timer
    * 2. Set initial time (30 minutes)
    * 3. Update display immediately
    * 4. Start countdown interval
    * 5. Stop when time reaches zero
    */
    public startCooldown() {
        // Clear any existing timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        // Set initial time (30 minutes in seconds)
        let timeRemaining = 30 * 60;

        // Update immediately then start interval
        this.updateDisplay(timeRemaining);

        this.timerInterval = setInterval(() => {
            timeRemaining--;

            if (timeRemaining <= 0) {
                this.stopCooldown();
            } else {
                this.updateDisplay(timeRemaining);
            }
        }, 1000);
    }

   /**
    * @notice Stops the cooldown timer
    * @dev Clears interval and resets display
    * @custom:flow
    * 1. Clear interval if exists
    * 2. Reset interval reference
    * 3. Reset display to zero
    */
    private stopCooldown() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        // Reset display
        if (this.cooldownElement) {
            this.cooldownElement.textContent = 'xp cooldown: 0';
        }
    }

   /**
    * @notice Updates the timer display
    * @dev Formats and displays time in minutes and seconds
    * @param seconds Remaining time in seconds
    * @custom:format "xp cooldown: Xm Ys"
    */
    private updateDisplay(seconds: number) {
        if (!this.cooldownElement) return;

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        this.cooldownElement.textContent = `xp cooldown: ${minutes}m ${remainingSeconds}s`;
    }
}
