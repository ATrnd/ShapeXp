/**
* @title Contract Error Type Definitions
* @notice Defines error types and signatures for ShapeXp contract interactions
* @dev Contains core error types and standardized signatures
* @custom:module-hierarchy Core Error Types Component
*/

/**
* @notice Cooldown error data structure
* @dev Contains timestamp data for cooldown errors
* @custom:fields
* - timeRemaining: Seconds until cooldown expires
*/
export interface OnCooldownError {
    timeRemaining: bigint;
}

/**
* @notice Contract error signature definitions
* @dev Maps error names to their solidity signatures
* @custom:errors
* - OnCooldown: Experience gain cooldown
* - NotShapeXpNFTOwner: Missing NFT ownership
* - InvalidExperienceType: Invalid experience parameter
*/
export const ShapeXpErrorSignatures = {
    OnCooldown: "ShapeXpInvExp__OnCooldown(uint256)",
    NotShapeXpNFTOwner: "ShapeXpInvExp__NotShapeXpNFTOwner()",
    InvalidExperienceType: "ShapeXpInvExp__InvalidExperienceType()"
} as const;
