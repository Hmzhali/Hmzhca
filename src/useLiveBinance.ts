import { useState, useEffect } from 'react';

export interface LiveCoin {
  symbol: string;
  price: string;
  change: number;
  high: number;
  low: number;
}

export function useLiveBinance(pairs: { symbol: string; [key: string]: any }[] = []) {
  const [liveCoins, setLiveCoins] = useState<LiveCoin[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const serializedSymbols = JSON.stringify(pairs.map(p => p.symbol));

  useEffect(() => {
    let isMounted = true;
    const parsedSymbols: string[] = JSON.parse(serializedSymbols);
    const coinsToTrack = parsedSymbols.length > 0 ? parsedSymbols : ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT'];
    const formattedQuery = coinsToTrack.map(s => `"${s.replace('/', '')}"`).join(',');
    const symbolsJson = `[${formattedQuery}]`;

    const fetchPrices = async () => {
      try {
        const response = await fetch(`/api/binance/prices?symbols=${encodeURIComponent(symbolsJson)}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const dataArr = Array.isArray(data) ? data : [data];
        if (isMounted) {
          const formatted = dataArr.map((item: any) => {
            return {
              symbol: item.symbol,
              price: item.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 4 }),
              change: item.change24h,
              high: item.high24h,
              low: item.low24h,
            };
          });
          setLiveCoins(formatted);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError' && err.message !== 'Failed to fetch') {
          console.warn('Failed to fetch live prices in useLiveBinance hook. Error:', err.message);
        }
        setIsLoading(false);
      }
    };

    fetchPrices();

    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connectWS = () => {
      if (!isMounted) return;
      try {
        const streamNames = coinsToTrack
          .map((sym) => sym.replace('/', '').toLowerCase() + '@ticker')
          .join('/');

        ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streamNames}`);

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const rawData = JSON.parse(event.data);
            if (rawData && rawData.s) {
              const wsSymbol = rawData.s; // 'BTCUSDT'
              
              // Use a ref to store the latest data to avoid rapid state updates
              if (!(window as any).tickerDataRef) (window as any).tickerDataRef = {};
              (window as any).tickerDataRef[wsSymbol] = {
                price: parseFloat(rawData.c),
                change: parseFloat(rawData.P),
                high: parseFloat(rawData.h),
                low: parseFloat(rawData.l)
              };

              // Throttled state update
              if (!(window as any).tickerUpdateTimeout) {
                (window as any).tickerUpdateTimeout = setTimeout(() => {
                  setLiveCoins((prevCoins) => {
                    const latestData = (window as any).tickerDataRef;
                    if (!latestData) return prevCoins;
                    
                    return prevCoins.map((coin) => {
                      const wsSymbolForCoin = coin.symbol.replace('/', '');
                      const data = latestData[wsSymbolForCoin];
                      if (data) {
                        return {
                          ...coin,
                          price: data.price.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 4 }),
                          change: data.change,
                          high: data.high,
                          low: data.low
                        };
                      }
                      return coin;
                    });
                  });
                  (window as any).tickerUpdateTimeout = null;
                }, 500); // Throttled to 500ms
              }
              setIsLoading(false);
            }
          } catch (e) {
            // safe swallow
          }
        };

        ws.onclose = () => {
          if (isMounted) {
            reconnectTimeout = setTimeout(connectWS, 4050);
          }
        };

        ws.onerror = () => {
          if (ws) ws.close();
        };
      } catch (error) {
        console.error('WebSocket connection error in hook:', error);
      }
    };

    connectWS();

    const interval = setInterval(fetchPrices, 6000);

    return () => {
      isMounted = false;
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      clearInterval(interval);
    };
  }, [serializedSymbols]);

  return { liveCoins, isLoading };
}
