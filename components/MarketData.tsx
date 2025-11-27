import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Badge } from './UIComponents';
import { OrderBookEntry, Language } from '../types';
import { t } from '../utils/i18n';

const generateMockOrderBook = (basePrice: number): { asks: OrderBookEntry[], bids: OrderBookEntry[] } => {
  const asks = [];
  const bids = [];
  let totalAsk = 0;
  let totalBid = 0;

  for (let i = 0; i < 10; i++) {
    const askPrice = basePrice + (i * 0.5) + Math.random();
    const askAmount = Math.random() * 2;
    totalAsk += askAmount;
    asks.push({ price: askPrice, amount: askAmount, total: totalAsk });

    const bidPrice = basePrice - (i * 0.5) - Math.random();
    const bidAmount = Math.random() * 2;
    totalBid += bidAmount;
    bids.push({ price: bidPrice, amount: bidAmount, total: totalBid });
  }
  return { asks: asks.reverse(), bids };
};

export const MarketData: React.FC<{lang: Language}> = ({ lang }) => {
  const [basePrice, setBasePrice] = useState(64230.50);
  const [data, setData] = useState(generateMockOrderBook(basePrice));
  
  // Trade Form
  const [side, setSide] = useState<'buy'|'sell'>('buy');

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate market movement
      const move = (Math.random() - 0.5) * 10;
      setBasePrice(prev => Math.max(0, prev + move));
      setData(generateMockOrderBook(basePrice));
    }, 1000);
    return () => clearInterval(interval);
  }, [basePrice]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      
      {/* Order Book Column */}
      <Card className="lg:col-span-2 flex flex-col h-full p-0 overflow-hidden" title="">
        <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
            <h3 className="font-bold text-lg text-white">BTC/USDT {t('orderBook', lang)}</h3>
            <div className="flex gap-2">
                 <Badge color="green">{t('connected', lang)}</Badge>
                 <span className="text-slate-400 text-sm font-mono">{new Date().toLocaleTimeString()}</span>
            </div>
        </div>

        <div className="grid grid-cols-2 text-xs uppercase text-slate-500 font-semibold p-2 border-b border-slate-800">
             <div className="pl-4">{t('bidSide', lang)}</div>
             <div className="text-right pr-4">{t('askSide', lang)}</div>
        </div>

        <div className="flex-1 overflow-y-auto relative font-mono text-sm">
            {/* Header */}
            <div className="grid grid-cols-6 sticky top-0 bg-slate-900 z-10 py-2 border-b border-slate-800 text-xs text-slate-500 px-2">
                 <div className="col-span-1">{t('total', lang)}</div>
                 <div className="col-span-1 text-center">{t('amt', lang)}</div>
                 <div className="col-span-1 text-right text-emerald-500">{t('bidPrice', lang)}</div>
                 <div className="col-span-1 text-left text-rose-500 pl-2">{t('askPrice', lang)}</div>
                 <div className="col-span-1 text-center">{t('amt', lang)}</div>
                 <div className="col-span-1 text-right">{t('total', lang)}</div>
            </div>

            {/* Rows - We map bids and asks side by side for visual density, though traditionally they are stacked. 
                For this "CEX Tool" view, let's stack them meeting in the middle like a professional terminal. 
            */}
             
             {/* Asks (Red, Top) */}
             <div className="flex flex-col-reverse justify-end pb-2">
                 {data.asks.map((ask, idx) => (
                    <div key={idx} className="grid grid-cols-3 hover:bg-slate-800/50 cursor-pointer px-2 py-0.5">
                         {/* Empty Left Side */}
                         <div className="col-span-3 grid grid-cols-3">
                             <div className="opacity-0">.</div><div className="opacity-0">.</div><div className="opacity-0">.</div>
                         </div>
                    </div>
                 ))}
             </div>
             
             {/* Middle Price */}
             <div className="py-3 text-center text-2xl font-bold text-white bg-slate-800/30 border-y border-slate-800 my-1 sticky top-1/2 -translate-y-1/2 z-20 backdrop-blur-sm">
                 {basePrice.toFixed(2)} <span className="text-sm text-slate-400 font-normal">USD</span>
             </div>

            <div className="flex w-full">
                {/* Bids */}
                <div className="w-1/2 border-r border-slate-800">
                    {data.bids.map((bid, i) => (
                         <div key={i} className="flex justify-between px-3 py-1 hover:bg-emerald-900/10 cursor-pointer relative">
                             <div className="absolute inset-0 bg-emerald-500/5" style={{ width: `${Math.min(bid.total * 5, 100)}%` }}></div>
                             <span className="relative z-10 text-slate-400">{bid.total.toFixed(3)}</span>
                             <span className="relative z-10 text-slate-200">{bid.amount.toFixed(4)}</span>
                             <span className="relative z-10 text-emerald-400">{bid.price.toFixed(2)}</span>
                         </div>
                    ))}
                </div>
                {/* Asks (Re-rendered correctly for split view) */}
                 <div className="w-1/2">
                    {data.asks.slice().reverse().map((ask, i) => (
                         <div key={i} className="flex justify-between px-3 py-1 hover:bg-rose-900/10 cursor-pointer relative">
                             <span className="relative z-10 text-rose-400">{ask.price.toFixed(2)}</span>
                             <span className="relative z-10 text-slate-200">{ask.amount.toFixed(4)}</span>
                             <span className="relative z-10 text-slate-400">{ask.total.toFixed(3)}</span>
                             <div className="absolute right-0 top-0 bottom-0 bg-rose-500/5" style={{ width: `${Math.min(ask.total * 5, 100)}%` }}></div>
                         </div>
                    ))}
                </div>
            </div>

        </div>
      </Card>

      {/* Manual Trade Column */}
      <Card title={t('manualTrade', lang)} className="h-fit">
        <div className="flex gap-2 p-1 bg-slate-800 rounded mb-6">
            <button 
                onClick={() => setSide('buy')}
                className={`flex-1 py-2 text-sm font-bold rounded shadow-sm transition-all ${side === 'buy' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
                {t('buyLimit', lang)}
            </button>
            <button 
                onClick={() => setSide('sell')}
                className={`flex-1 py-2 text-sm font-bold rounded shadow-sm transition-all ${side === 'sell' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
                {t('sellLimit', lang)}
            </button>
        </div>

        <div className="space-y-4">
            <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                    <span>{t('avail', lang)}: 45,200 USDT</span>
                    <span>{t('wallet', lang)}: Main</span>
                </div>
                <Select options={[{ label: 'Binance - Main', value: '1' }, { label: 'OKX - Hedge', value: '2' }]} />
            </div>

            <Input label={t('priceUSDT', lang)} type="number" defaultValue={basePrice.toFixed(2)} />
            <Input label={t('amountBTC', lang)} type="number" placeholder="0.00" />
            
            <div className="pt-2">
                <div className="flex justify-between mb-2 text-sm text-slate-400">
                    <span>{t('total', lang)}</span>
                    <span>0.00 USDT</span>
                </div>
                <Button 
                    variant={side === 'buy' ? 'primary' : 'danger'} 
                    className={`w-full h-12 text-lg ${side === 'buy' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
                >
                    {side === 'buy' ? `${t('buy', lang)} BTC` : `${t('sell', lang)} BTC`}
                </Button>
            </div>

             <div className="mt-6 border-t border-slate-800 pt-4">
                 <h4 className="text-sm font-bold text-slate-300 mb-3">{t('quickAction', lang)}</h4>
                 <div className="grid grid-cols-2 gap-2">
                    <Button variant="secondary" size="sm" className="text-xs">{t('cancelBids', lang)}</Button>
                    <Button variant="secondary" size="sm" className="text-xs">{t('cancelAsks', lang)}</Button>
                    <Button variant="secondary" size="sm" className="text-xs col-span-2 text-red-400">{t('panicSell', lang)}</Button>
                 </div>
             </div>
        </div>
      </Card>
    </div>
  );
};
