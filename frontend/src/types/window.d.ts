/**
* @title Window Ethereum Provider Type Extensions
* @notice Type definitions for MetaMask/Web3 provider
* @dev Extends global Window interface with Ethereum provider types
* @custom:module-hierarchy Core Type Definitions Component
*/

export {};

/**
* @notice Global window type extensions
* @dev Adds Ethereum provider types to Window interface
* @custom:environment Browser runtime
*/
declare global {

 /**
  * @notice Window interface extension
  * @dev Adds ethereum property to Window global
  */
  interface Window {
   /**
    * @notice Ethereum provider interface
    * @dev MetaMask/Web3 provider API definition
    * @custom:properties
    * - isMetaMask: Provider identification
    * - request: JSON-RPC method handler
    * - on: Event subscription method
    * - removeListener: Event unsubscription method
    * - selectedAddress: Connected account
    * - networkVersion: Network identifier
    * - chainId: Chain identifier
    */
    ethereum?: {
      isMetaMask?: boolean;
      request?: (...args: any[]) => Promise<any>;
      on?: (event: string, callback: (...args: any[]) => void) => void;
      removeListener?: (event: string, callback: (...args: any[]) => void) => void;
      selectedAddress?: string | null;
      networkVersion?: string;
      chainId?: string;
    };
  }
}
