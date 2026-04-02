// services/walletService.ts
// Clarix — Real Web3 Wallet Connection (MetaMask + WalletConnect)

export interface WalletState {
  address: string;
  chainId: number;
  chainName: string;
  balance: string; // in ETH
  balanceUSD: number;
  provider: 'metamask' | 'walletconnect' | 'coinbase';
  isConnected: boolean;
}

export interface WalletError {
  code: string;
  message: string;
  userMessage: string;
}

// ─── Chain config ─────────────────────────────────────────────────────────────
const SUPPORTED_CHAINS: Record<number, string> = {
  1: 'Ethereum Mainnet',
  137: 'Polygon',
  42161: 'Arbitrum One',
  8453: 'Base',
  56: 'BNB Chain',
  10: 'Optimism',
};

// ─── Get chain name ───────────────────────────────────────────────────────────
export function getChainName(chainId: number): string {
  return SUPPORTED_CHAINS[chainId] || `Chain ${chainId}`;
}

// ─── Format ETH balance ───────────────────────────────────────────────────────
function hexToEth(hexBalance: string): string {
  const wei = parseInt(hexBalance, 16);
  const eth = wei / 1e18;
  return eth.toFixed(4);
}

// ─── MetaMask Connection ──────────────────────────────────────────────────────
export async function connectMetaMask(): Promise<WalletState> {
  if (typeof window.ethereum === 'undefined') {
    throw {
      code: 'NO_METAMASK',
      message: 'MetaMask not installed',
      userMessage: 'MetaMask is not installed. Please install it from metamask.io to connect your wallet.',
    } as WalletError;
  }

  try {
    // Request account access
    const accounts: string[] = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (!accounts || accounts.length === 0) {
      throw {
        code: 'NO_ACCOUNTS',
        message: 'No accounts returned',
        userMessage: 'No accounts found. Please create or unlock your MetaMask wallet.',
      } as WalletError;
    }

    const address = accounts[0];

    // Get chain ID
    const chainIdHex: string = await window.ethereum.request({ method: 'eth_chainId' });
    const chainId = parseInt(chainIdHex, 16);

    // Get balance
    const balanceHex: string = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [address, 'latest'],
    });

    return {
      address,
      chainId,
      chainName: getChainName(chainId),
      balance: hexToEth(balanceHex),
      balanceUSD: 0, // Populated by marketService
      provider: 'metamask',
      isConnected: true,
    };
  } catch (err: any) {
    if (err.code === 4001 || err.message?.includes('User rejected')) {
      throw {
        code: 'USER_REJECTED',
        message: 'User rejected connection',
        userMessage: 'You cancelled the wallet connection. Try again when ready.',
      } as WalletError;
    }
    if (err.code && err.userMessage) throw err; // Re-throw our typed errors
    throw {
      code: 'CONNECTION_FAILED',
      message: err.message || 'Unknown error',
      userMessage: 'Failed to connect wallet. Please try again.',
    } as WalletError;
  }
}

// ─── WalletConnect Connection ─────────────────────────────────────────────────
export async function connectWalletConnect(): Promise<WalletState> {
  const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

  if (!projectId) {
    throw {
      code: 'NO_PROJECT_ID',
      message: 'WalletConnect Project ID not set',
      userMessage: 'WalletConnect is not configured. Please add VITE_WALLETCONNECT_PROJECT_ID to your environment variables.',
    } as WalletError;
  }

  try {
    // Dynamically import WalletConnect to avoid bundle bloat for non-WC users
    const { EthereumProvider } = await import('@walletconnect/ethereum-provider');

    const provider = await EthereumProvider.init({
      projectId,
      chains: [1],
      optionalChains: [137, 42161, 8453, 56],
      showQrModal: true,
    });

    await provider.connect();

    const accounts = provider.accounts;
    if (!accounts || accounts.length === 0) {
      throw {
        code: 'NO_ACCOUNTS',
        message: 'No accounts returned from WalletConnect',
        userMessage: 'No accounts found after connecting. Please try again.',
      } as WalletError;
    }

    const address = accounts[0];
    const chainId = provider.chainId;
    const balanceHex: string = await provider.request({
      method: 'eth_getBalance',
      params: [address, 'latest'],
    });

    return {
      address,
      chainId,
      chainName: getChainName(chainId),
      balance: hexToEth(balanceHex),
      balanceUSD: 0,
      provider: 'walletconnect',
      isConnected: true,
    };
  } catch (err: any) {
    if (err.code && err.userMessage) throw err;
    if (err.message?.includes('User rejected') || err.message?.includes('closed')) {
      throw {
        code: 'USER_REJECTED',
        message: 'User closed WalletConnect modal',
        userMessage: 'Connection cancelled. Scan the QR code to connect your mobile wallet.',
      } as WalletError;
    }
    throw {
      code: 'WC_FAILED',
      message: err.message || 'WalletConnect error',
      userMessage: 'WalletConnect failed. Please try MetaMask or try again.',
    } as WalletError;
  }
}

// ─── Disconnect ───────────────────────────────────────────────────────────────
export async function disconnectWallet(provider: string): Promise<void> {
  if (provider === 'walletconnect') {
    try {
      const { EthereumProvider } = await import('@walletconnect/ethereum-provider');
      // WalletConnect cleanup — provider instance would need to be stored globally
      // For now we just clear local state
    } catch (e) {}
  }
  // MetaMask doesn't have a programmatic disconnect — user does it in extension
}

// ─── Listen for account/chain changes ────────────────────────────────────────
export function watchWalletChanges(
  onAccountChange: (address: string) => void,
  onChainChange: (chainId: number) => void,
  onDisconnect: () => void
): () => void {
  if (typeof window.ethereum === 'undefined') return () => {};

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      onDisconnect();
    } else {
      onAccountChange(accounts[0]);
    }
  };

  const handleChainChanged = (chainIdHex: string) => {
    onChainChange(parseInt(chainIdHex, 16));
  };

  const handleDisconnect = () => onDisconnect();

  window.ethereum.on('accountsChanged', handleAccountsChanged);
  window.ethereum.on('chainChanged', handleChainChanged);
  window.ethereum.on('disconnect', handleDisconnect);

  // Return cleanup function
  return () => {
    window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
    window.ethereum?.removeListener('chainChanged', handleChainChanged);
    window.ethereum?.removeListener('disconnect', handleDisconnect);
  };
}

// ─── Switch to a supported chain ─────────────────────────────────────────────
export async function switchChain(chainId: number): Promise<void> {
  if (typeof window.ethereum === 'undefined') return;

  const chainIdHex = `0x${chainId.toString(16)}`;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });
  } catch (err: any) {
    // Chain not added to MetaMask — add it
    if (err.code === 4902) {
      throw {
        code: 'CHAIN_NOT_ADDED',
        message: `Chain ${chainId} not in MetaMask`,
        userMessage: `Please add ${getChainName(chainId)} network to your wallet manually.`,
      } as WalletError;
    }
    throw err;
  }
}

// ─── Check if already connected ──────────────────────────────────────────────
export async function checkExistingConnection(): Promise<string | null> {
  if (typeof window.ethereum === 'undefined') return null;

  try {
    const accounts: string[] = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts.length > 0 ? accounts[0] : null;
  } catch {
    return null;
  }
}
