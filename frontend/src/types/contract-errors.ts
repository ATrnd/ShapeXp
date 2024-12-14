export interface OnCooldownError {
    timeRemaining: bigint;
}

export const ShapeXpErrorSignatures = {
    OnCooldown: "ShapeXpInvExp__OnCooldown(uint256)",
    NotShapeXpNFTOwner: "ShapeXpInvExp__NotShapeXpNFTOwner()",
    InvalidExperienceType: "ShapeXpInvExp__InvalidExperienceType()"
} as const;
