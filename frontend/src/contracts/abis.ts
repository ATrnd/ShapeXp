import { Interface } from 'ethers';

export const SHAPE_XP_NFT_ABI = [
   {
        "type": "function",
        "name": "mint",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "name",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "string",
                "internalType": "string"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "hasMintedToken",
        "inputs": [
            {
                "name": "user",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    }
] as const;

export const SHAPE_XP_INV_EXP_ABI = [
        {
            "type": "constructor",
            "inputs": [
                {
                    "name": "shapeNFTCtr",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "addGlobalExperience",
            "inputs": [
                {
                    "name": "expType",
                    "type": "uint8",
                    "internalType": "enum ShapeXpInvExp.ExperienceAmount"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "addNFTExperience",
            "inputs": [
                {
                    "name": "nftContract",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "tokenId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "addNFTToInventory",
            "inputs": [
                {
                    "name": "nftContract",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "tokenId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "getGlobalExperience",
            "inputs": [
                {
                    "name": "user",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getNFTExperience",
            "inputs": [
                {
                    "name": "user",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "nftContract",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "tokenId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "hasNFT",
            "inputs": [
                {
                    "name": "user",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "nftContract",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "tokenId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "removeNFTFromInventory",
            "inputs": [
                {
                    "name": "nftContract",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "tokenId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "validateNFTOwnership",
            "inputs": [
                {
                    "name": "NFTCtr",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "tokenId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "validateNonShapeXpNFT",
            "inputs": [
                {
                    "name": "NFTCtr",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "validateShapeXpNFTOwnership",
            "inputs": [],
            "outputs": [],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "viewInventory",
            "inputs": [
                {
                    "name": "user",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "address[3]",
                    "internalType": "address[3]"
                },
                {
                    "name": "",
                    "type": "uint256[3]",
                    "internalType": "uint256[3]"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "event",
            "name": "ExperienceAdded",
            "inputs": [
                {
                    "name": "user",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "targetNftContract",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "tokenId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                },
                {
                    "name": "newTotal",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "ExperienceCapped",
            "inputs": [
                {
                    "name": "user",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "expType",
                    "type": "uint8",
                    "indexed": false,
                    "internalType": "enum ShapeXpInvExp.ExperienceAmount"
                },
                {
                    "name": "attemptedAmount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                },
                {
                    "name": "cappedAmount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "ExperienceCappedNFT",
            "inputs": [
                {
                    "name": "user",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "attemptedAmount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                },
                {
                    "name": "cappedAmount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "GlobalExperienceAdded",
            "inputs": [
                {
                    "name": "user",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "expType",
                    "type": "uint8",
                    "indexed": false,
                    "internalType": "enum ShapeXpInvExp.ExperienceAmount"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                },
                {
                    "name": "newTotal",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "GlobalExperienceDeducted",
            "inputs": [
                {
                    "name": "user",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                },
                {
                    "name": "remaining",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "error",
            "name": "ShapeXpInvExp__InsufficientGlobalExperience",
            "inputs": []
        },
        {
            "type": "error",
            "name": "ShapeXpInvExp__InvalidERC721Contract",
            "inputs": []
        },
        {
            "type": "error",
            "name": "ShapeXpInvExp__InvalidExperienceType",
            "inputs": []
        },
        {
            "type": "error",
            "name": "ShapeXpInvExp__InvalidShapeXpContract",
            "inputs": []
        },
        {
            "type": "error",
            "name": "ShapeXpInvExp__InventoryFull",
            "inputs": []
        },
        {
            "type": "error",
            "name": "ShapeXpInvExp__NFTAlreadyInInventory",
            "inputs": []
        },
        {
            "type": "error",
            "name": "ShapeXpInvExp__NFTNotInInventory",
            "inputs": []
        },
        {
            "type": "error",
            "name": "ShapeXpInvExp__NotInInventory",
            "inputs": []
        },
        {
            "type": "error",
            "name": "ShapeXpInvExp__NotNFTOwner",
            "inputs": []
        },
        {
            "type": "error",
            "name": "ShapeXpInvExp__NotShapeXpNFTOwner",
            "inputs": []
        },
        {
            "type": "error",
            "name": "ShapeXpInvExp__OnCooldown",
            "inputs": [
                {
                    "name": "timeRemaining",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ]
        }

] as Interface | any[];

export enum ExperienceAmount {
    LOW = 0,
    MID = 1,
    HIGH = 2
}


