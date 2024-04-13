import { type ChangeEvent, useCallback, useEffect, useState } from 'react';
import { sendCalls } from 'viem/experimental';
import { base } from 'viem/chains';
import { encodeFunctionData, erc20Abi, parseUnits } from 'viem';
import { useAccount, useWalletClient } from 'wagmi';
import { swapperAbi } from '../../abi/swapper';
import { useGetQuote } from './hooks/useGetQuote';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExchangeAlt, faPersonFalling } from '@fortawesome/free-solid-svg-icons';
import { faCog, faInfoCircle, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import 'globals'

const swapper = '0xc1461E7A8f29109A8C2C0b60dAa1e12A317075AB';

const tokenList = [
  { symbol: 'USDC', address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', decimals: 6 },
  { symbol: 'WETH', address: '0x1234567890123456789012345678901234567890', decimals: 18 },
  // Add more tokens as needed
];

export function Swap() {
  const [amountIn, setAmountIn] = useState('0');
  const [debouncedAmountIn, setDebouncedAmountIn] = useState('0');
  const [amountOut, setAmountOut] = useState('0');
  const [transactionId, setTransactionId] = useState('');
  const [selectedTokenIn, setSelectedTokenIn] = useState(tokenList[0]);
  const [selectedTokenOut, setSelectedTokenOut] = useState(tokenList[1]);
  const [isTokenInDropdownOpen, setIsTokenInDropdownOpen] = useState(false);
  const [isTokenOutDropdownOpen, setIsTokenOutDropdownOpen] = useState(false);
  const [showFooter, setShowFooter] = useState(false);

  const { quote } = useGetQuote({ amountIn: debouncedAmountIn });
  const { data: walletClient } = useWalletClient({ chainId: 84532 });
  const { address } = useAccount();

  useEffect(() => {
    const delay = setTimeout(() => {
      setDebouncedAmountIn(amountIn);
      setShowFooter(parseFloat(amountIn) > 0);
    }, 500);
    return () => clearTimeout(delay);
  }, [amountIn]);

  useEffect(() => {
    if (quote) {
      setAmountOut(Number.parseFloat(quote).toFixed(7));
    }
  }, [quote]);

  const handleChangeAmount = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setAmountIn(e.target.value);
  }, []);

  const handleSelectTokenIn = useCallback((token: typeof tokenList[number]) => {
    setSelectedTokenIn(token);
    if (token.address === selectedTokenOut.address) {
      setSelectedTokenOut(selectedTokenIn);
    }
    setIsTokenInDropdownOpen(false);
  }, [selectedTokenIn, selectedTokenOut]);

  const handleSelectTokenOut = useCallback((token: typeof tokenList[number]) => {
    setSelectedTokenOut(token);
    if (token.address === selectedTokenIn.address) {
      setSelectedTokenIn(selectedTokenOut);
    }
    setIsTokenOutDropdownOpen(false);
  }, [selectedTokenIn, selectedTokenOut]);

  const handleSwitchTokens = useCallback(() => {
    setSelectedTokenIn(selectedTokenOut);
    setSelectedTokenOut(selectedTokenIn);
  }, [selectedTokenIn, selectedTokenOut]);

  const handleSwap = useCallback(async () => {
    if (walletClient && address) {
      console.log('handleSwap called');
      try {
        const txId = await sendCalls(walletClient, {
          chain: base,
          account: address,
          capabilities: {
            paymasterService: { url: 'http://localhost:3000/api' },
          },
          calls: [
            {
              to: selectedTokenIn.address as `0x${string}`,
              data: encodeFunctionData({
                abi: erc20Abi,
                functionName: 'approve',
                args: [swapper, parseUnits(amountIn, selectedTokenIn.decimals)],
              }),
            },
            {
              to: swapper,
              data: encodeFunctionData({
                abi: swapperAbi,
                functionName: 'swap',
                args: [
                  parseUnits(amountIn, selectedTokenIn.decimals),
                  parseUnits(quote, selectedTokenOut.decimals),
                ],
              }),
            },
          ],
        });
        setTransactionId(txId);
        console.log('Transaction ID:', transactionId);
      } catch (error) {
        console.error('Transaction error:', error);
      }
    }
  }, [walletClient, address, amountIn, quote, sendCalls, selectedTokenIn, selectedTokenOut]);

  return (
    <div className="swap-component flex flex-col w-full justify-center items-center space-y-0 h-96 relative">
      <div className="flex-row">
      <div>
        <input
          type="text"
          placeholder="paste contract address..."
          className="search-bar px-4 py-2 text-blue-600 focus:outline-none"
        />
      </div>
      <div className="swapper-header absolute top-8 left-12 text-blue-600 text-3xl font-bold">
        <h2>smartswap</h2>
      </div>
      <div className="header-tab absolute top-8 right-12 bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-t-lg px-4 py-2 shadow-lg transition-transform duration-300 ease-in-out transform-gpu translate-y-0 flex items-center justify-center space-x-6">
        <FontAwesomeIcon icon={faCog} className="text-blue-600 cursor-pointer" />
        <div className="relative">
          <input
            type="checkbox"
            id="theme-toggle"
            className="hidden"
            // Add onChange handler to toggle theme
          />
          <label htmlFor="theme-toggle" className="cursor-pointer">
            <FontAwesomeIcon size='sm' icon={faMoon} className="text-blue-600 dark:hidden" />
            <FontAwesomeIcon size='sm' icon={faSun} className="text-blue-600 hidden dark:block" />
          </label>
        </div>
        <FontAwesomeIcon size='sm' icon={faInfoCircle} className="text-blue-600 cursor-pointer" />
      </div>
      </div>
      <div className="w-96 h-64 rounded-2xl shadow-lg relative bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg swapper">
        <div className="w-full h-full flex flex-col rounded-2xl shadow-sm bg-transparent divide-y divide-blue-800 divide-opacity-40 px-4 z-10">
          <div className="flex flex-row w-full h-full justify-between items-center">
            <input
              value={amountIn}
              onChange={handleChangeAmount}
              className="text-blue-600 bg-transparent border-none h-full w-full flex items-center justify-center px-2 text-2xl focus:outline-none"
            />
            <div className="relative">
              <span
                className="text-blue-600 text-2xl cursor-pointer inline-block bg-clip-text"
                onClick={() => setIsTokenInDropdownOpen(!isTokenInDropdownOpen)}
              >
                {selectedTokenIn.symbol}
              </span>
              {isTokenInDropdownOpen && (
                <div className="absolute top-full mt-0 w-40 bg-white bg-opacity-100 backdrop-filter backdrop-blur-lg shadow-lg rounded-lg z-20 dropdown2">
                  {tokenList.map((token) => (
                    <div
                      key={token.symbol}
                      className="px-2 py-2 hover:bg-blue-300 hover:bg-opacity-20 cursor-pointer"
                      onClick={() => handleSelectTokenIn(token)}
                    >
                      {token.symbol}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleSwitchTokens}
            className="switch-button"
          >
            <FontAwesomeIcon icon={faExchangeAlt} className='rotate-icon' />
          </button>
          <div className="flex flex-row w-full h-full justify-between items-center">
            <input
              disabled
              className="bg-transparent border-none h-full w-full flex items-center justify-center text-blue-600 px-2 text-2xl disabled cursor-default focus:outline-none"
              value={amountOut}
            />
            <div className="relative">
              <span
                className="text-2xl text-blue-600 cursor-pointer inline-block bg-clip-text"
                onClick={() => setIsTokenOutDropdownOpen(!isTokenOutDropdownOpen)}
              >
                {selectedTokenOut.symbol}
              </span>
              {isTokenOutDropdownOpen && (
                <div className="absolute top-full mt-0 w-40 bg-white bg-opacity-100 backdrop-filter backdrop-blur-lg shadow-lg rounded-lg dropdown">
                  {tokenList.map((token) => (
                    <div
                      key={token.symbol}
                      className="px-2 py-2 hover:bg-blue-300 hover:bg-opacity-20 cursor-pointer"
                      onClick={() => handleSelectTokenOut(token)}
                    >
                      {token.symbol}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div
        className={`swap-footer ${showFooter ? 'show' : ''}`}
      >
        <button
          type="button"
          onClick={handleSwap}
          className="bg-blue-600 text-sm py-2 shadow-md text-white hover:bg-blue-600 transition-colors duration-200 glowing-border"
        >
          Swap
        </button>
        <div className="text-blue-800 flex flex-col center items-center justify-center">
          <FontAwesomeIcon size="lg" className='mr-0' icon={faPersonFalling} />
          <span className='text-xs'>0.5%</span>
        </div>
      </div>
    </div>
  );
}