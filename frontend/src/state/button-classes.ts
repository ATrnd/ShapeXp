/**
* @title Button Styling Configuration
* @notice Defines standardized button styles and state-based classes
* @dev Uses Tailwind CSS classes for consistent button styling
* @custom:module-hierarchy UI Styling Component
*/

/**
* @notice Collection of button style configurations and utility methods
* @dev Implements Tailwind CSS classes for button styling
* @custom:styling-system
* - Base styles
* - State-based styles
* - Success states
* - Combined states
* - Utility functions
*/
export const ButtonClasses = {

   /**
    * @notice Base button styling
    * @dev Core button dimensions and visual properties
    * @custom:properties
    * - Width: 280px
    * - Height: 41px
    * - Border: 2px
    * - Rounded corners
    * - Uppercase text
    * - Smooth transitions
    */
    base: 'w-[280px] h-[41px] border-2 rounded-lg uppercase text-base transition-all duration-300 ease-in-out',

   /**
    * @notice State-based styling classes
    * @dev Visual styles for different button states
    */
    default: 'border-[#FF7272] hover:border-orange-600 hover:scale-105',
    disabled: 'opacity-50 cursor-not-allowed',
    progress: 'border-[#FF7272] opacity-75',

   /**
    * @notice Success state styling classes
    * @dev Visual feedback for successful actions
    * @custom:colors
    * - Connected: Green (#AAFF72)
    * - Minted: Green (#AAFF72)
    * - Gained: Yellow (#FFFF72)
    */
    connected: 'border-[#AAFF72] text-white',
    minted: 'border-[#AAFF72] text-white',
    gained: 'border-[#FFFF72] text-white',

   /**
    * @notice Combined state classes
    * @dev Pre-combined classes for common states
    */
    defaultWithDisabled: 'border-[#FF7272] disabled:opacity-50 disabled:cursor-not-allowed',

   /**
    * @notice Utility function to combine classes
    * @dev Merges base classes with additional classes
    * @param classes Array of classes to combine with base
    * @return string Combined class string
    */
    combine: (...classes: string[]) => {
        return [ButtonClasses.base, ...classes].join(' ');
    },

   /**
    * @notice Getter functions for common class combinations
    * @dev Pre-defined class combinations for various states
    */
    getDefaultClasses: () => ButtonClasses.combine(ButtonClasses.default),
    getProgressClasses: () => ButtonClasses.combine(ButtonClasses.progress),
    getConnectedClasses: () => ButtonClasses.combine(ButtonClasses.connected, ButtonClasses.disabled),
    getMintedClasses: () => ButtonClasses.combine(ButtonClasses.minted, ButtonClasses.disabled),
    getDisabledClasses: () => ButtonClasses.combine(ButtonClasses.defaultWithDisabled),
    // getGainedClasses: () => ButtonClasses.combine(ButtonClasses.gained, ButtonClasses.disabled),
};
