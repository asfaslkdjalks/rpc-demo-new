'use client';
import { useCallback, useEffect } from 'react';
import { useAccount, useConnect, useSwitchChain } from 'wagmi';
import { Swap } from './components/Swap/Swap';
import { truncateMiddle } from './util/turncateMiddle';
import 'globals'

function App() {
  const { address } = useAccount();
  const { connectors, connect } = useConnect();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    switchChain({ chainId: 84532 });
  }, [address, switchChain]);

  const handleConnect = useCallback(() => {
    connect({ connector: connectors[0] });
  }, [connect, connectors]);

  return (
    <div className="flex relative flex-col h-screen w-full items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
      <div className="absolute flex top-8 right-12">
        <button
          onClick={handleConnect}
          type="button"
          className="bg-blue-600 text-white w-48 py-2 rounded-full shadow-md hover:bg-blue-600 transition-colors duration-200"
        >
          {address ? truncateMiddle(address.toLowerCase(), 6, 3) : 'smartwallet'}
        </button>
      </div>
      <Swap />
    </div>
  );
}

export default App;