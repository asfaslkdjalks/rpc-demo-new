'use client'

import { useCallback, useEffect } from 'react'
import { useAccount, useConnect, useSwitchChain } from 'wagmi'
import { Swap } from './components/Swap/Swap'
import { truncateMiddle } from './util/turncateMiddle'
import { baseSepolia } from 'viem/chains'
import { reloadIfNeeded } from './util/reloadIfNeeded'

function App() {

  const { connectAsync, connectors } = useConnect();
  const { switchChain } = useSwitchChain();
  const { address, chain } = useAccount();

  useEffect(() => {
    console.log('>> switching chain', chain?.id !== baseSepolia.id);
    console.log('>> address', address);
    if (address && chain?.id !== baseSepolia.id) {
      switchChain({ chainId: baseSepolia.id });
    }
  }, [address]);

  const handleConnect = useCallback(async () => {
    const connector = connectors.find((c) => c.type == 'coinbaseWallet');

    if (connector) {
      console.log('>> connecting', connector.type);
      try {
        await connectAsync({ connector });
      } finally {
        reloadIfNeeded();
      }
    }
  }, [connectAsync, connectors]);
  
  return (
    <div className="flex relative flex-col h-screen w-full items-center justify-center bg-zinc-900">
      <span className="absolute top-8 left-12 text-white text-3xl">Swapper</span>
      <div className="absolute flex top-8 right-12">
        <button
          onClick={handleConnect}
          type="button"
          className="bg-zinc-800 text-white w-48 py-2 rounded-md shadow-2xl"
        >
          {address ? truncateMiddle(address, 6, 3) : connectors[0].name}
        </button>
      </div>
      <Swap />
    </div>
  )
}

export default App
