






import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Badge, Modal, Pagination } from './UIComponents';
import { StrategyConfig, StrategyType, Exchange, Language, TransactionType, RandomStrategy, MMAccount, FollowStrategy, OrderBookStrategy, PriceBoundaryStrategy } from '../types';
import { Play, Square, Settings, Activity, TrendingUp, RefreshCw, BarChart2, Plus, Trash2, Edit, Search, CheckSquare } from 'lucide-react';
import { t } from '../utils/i18n';

// --- Mock Data for Dropdowns (In real app, pass from props or context) ---
// This mock data is used to simulate available accounts in the system.
// In Random Mode creation, we filter Exchange/TransactionType based on this.
const MOCK_MM_ACCOUNTS_FULL: MMAccount[] = [
    { id: 'm1', uid: '8839201', name: 'Binance Spot Main', exchange: Exchange.Binance, apiKey: '...', secretKey: '...', ipWhitelist: '', transactionTypes: ['Spot'], tradingPairs: ['BTC/USDT'], partition: 'Zone A', modificationTime: '' },
    { id: 'm2', uid: '1239944', name: 'OKX Hedge Futures', exchange: Exchange.OKX, apiKey: '...', secretKey: '...', ipWhitelist: '', transactionTypes: ['Contract'], tradingPairs: ['BTC-USDT-SWAP'], partition: 'Zone B', modificationTime: '' },
    { id: 'm3', uid: '5540021', name: 'Bybit Market Maker', exchange: Exchange.Bybit, apiKey: '...', secretKey: '...', ipWhitelist: '', transactionTypes: ['Spot', 'Contract'], tradingPairs: ['SOL/USDT'], partition: 'Zone A', modificationTime: '' },
];

const MOCK_MM_ACCOUNTS_SHORT = MOCK_MM_ACCOUNTS_FULL.map(a => ({ id: a.id, name: a.name }));

const MOCK_RANDOM_STRATEGIES: RandomStrategy[] = [
    { 
        id: 'rs1', taskId: '1', exchange: Exchange.Bybit, pair: 'A/USDT', transactionType: TransactionType.Contract, 
        account1Id: 'm3', account2Id: 'm2', minMakerPrice: 1, maxMakerPrice: 6, volatility: 0.1, 
        maxQtyList: '200,500,10000', minQtyList: '100,399,699', qtyChangePeriod: 5, 
        minOrderInterval: 8, maxOrderInterval: 16, status: 'stopped' 
    },
    { 
        id: 'rs2', taskId: '2', exchange: Exchange.Bybit, pair: 'A/USDT', transactionType: TransactionType.Spot, 
        account1Id: 'm3', account2Id: 'm3', minMakerPrice: 1, maxMakerPrice: 6, volatility: 0.1, 
        maxQtyList: '1000', minQtyList: '100', qtyChangePeriod: 1, 
        minOrderInterval: 8, maxOrderInterval: 16, status: 'running' 
    }
];

const MOCK_FOLLOW_STRATEGIES: FollowStrategy[] = [
    {
        id: 'fs1', taskId: '3', exchange: Exchange.Binance, pair: 'ETH/USDT', transactionType: TransactionType.Spot,
        account1Id: 'm1', account2Id: 'm1', 
        followExchanges: 'Bybit,OKX', followPairs: 'ETH/USDT,ETH-USDT-SWAP', followTransactionType: TransactionType.Spot,
        weights: '0.6,0.4', followChangePeriod: 5,
        maxQty: '10', minQty: '1', qtyChangePeriod: 10, maxOrderInterval: 20, minOrderInterval: 10, status: 'running'
    }
];

const MOCK_ORDERBOOK_STRATEGIES: OrderBookStrategy[] = [
    {
        id: 'ob1', taskId: '4', exchange: Exchange.OKX, pair: 'BTC-USDT-SWAP', transactionType: TransactionType.Perpetual,
        account1Id: 'm2', account2Id: 'm2', volatility: 0.2,
        maxQty: '50', minQty: '5', qtyChangePeriod: 3,
        minOrderInterval: 1, maxOrderInterval: 5, status: 'running'
    }
];

const MOCK_PRICE_BOUNDARY_STRATEGIES: PriceBoundaryStrategy[] = [
    {
        id: 'pb1', taskId: '5', exchange: Exchange.Binance, pair: 'BNB/USDT', transactionType: TransactionType.Spot,
        accountId: 'm1', minMakerPrice: 200, maxMakerPrice: 250, floatingValue: 0.5,
        maxQty: '100', minQty: '10', minOrderInterval: 2, maxOrderInterval: 10, status: 'running'
    }
];

export const StrategyManager: React.FC<{lang: Language, activeTab?: string}> = ({ lang, activeTab = 'kline' }) => {
  const [internalTab, setInternalTab] = useState(activeTab);
  
  // K-Line Sub-tabs
  const [klineSubTab, setKlineSubTab] = useState<StrategyType>(StrategyType.Random);

  useEffect(() => {
    setInternalTab(activeTab);
  }, [activeTab]);

  // --- Random Mode State ---
  const [randomStrategies, setRandomStrategies] = useState<RandomStrategy[]>(MOCK_RANDOM_STRATEGIES);
  const [randomSelectedIds, setRandomSelectedIds] = useState<Set<string>>(new Set());
  const [randomSearch, setRandomSearch] = useState({ taskId: '', exchange: '', pair: '', type: '', account: '' });
  const [randomPage, setRandomPage] = useState(1);
  const [randomItemsPerPage, setRandomItemsPerPage] = useState(10);

  const [isRandomModalOpen, setIsRandomModalOpen] = useState(false);
  const [isRandomEditMode, setIsRandomEditMode] = useState(false);
  const [currentRandom, setCurrentRandom] = useState<Partial<RandomStrategy>>({});

  // --- Follow Mode State ---
  const [followStrategies, setFollowStrategies] = useState<FollowStrategy[]>(MOCK_FOLLOW_STRATEGIES);
  const [followSelectedIds, setFollowSelectedIds] = useState<Set<string>>(new Set());
  const [followSearch, setFollowSearch] = useState({ taskId: '', exchange: '', pair: '', type: '', account: '' });
  const [followPage, setFollowPage] = useState(1);
  const [followItemsPerPage, setFollowItemsPerPage] = useState(10);

  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [isFollowEditMode, setIsFollowEditMode] = useState(false);
  const [currentFollow, setCurrentFollow] = useState<Partial<FollowStrategy>>({});

  // --- Order Book Mode State ---
  const [orderBookStrategies, setOrderBookStrategies] = useState<OrderBookStrategy[]>(MOCK_ORDERBOOK_STRATEGIES);
  const [orderBookSelectedIds, setOrderBookSelectedIds] = useState<Set<string>>(new Set());
  const [orderBookSearch, setOrderBookSearch] = useState({ taskId: '', exchange: '', pair: '', type: '', account: '' });
  const [orderBookPage, setOrderBookPage] = useState(1);
  const [orderBookItemsPerPage, setOrderBookItemsPerPage] = useState(10);

  const [isOrderBookModalOpen, setIsOrderBookModalOpen] = useState(false);
  const [isOrderBookEditMode, setIsOrderBookEditMode] = useState(false);
  const [currentOrderBook, setCurrentOrderBook] = useState<Partial<OrderBookStrategy>>({});

  // --- Price Boundary Mode State ---
  const [priceBoundaryStrategies, setPriceBoundaryStrategies] = useState<PriceBoundaryStrategy[]>(MOCK_PRICE_BOUNDARY_STRATEGIES);
  const [priceBoundarySelectedIds, setPriceBoundarySelectedIds] = useState<Set<string>>(new Set());
  const [priceBoundarySearch, setPriceBoundarySearch] = useState({ taskId: '', exchange: '', pair: '', type: '', account: '' });
  const [priceBoundaryPage, setPriceBoundaryPage] = useState(1);
  const [priceBoundaryItemsPerPage, setPriceBoundaryItemsPerPage] = useState(10);

  const [isPriceBoundaryModalOpen, setIsPriceBoundaryModalOpen] = useState(false);
  const [isPriceBoundaryEditMode, setIsPriceBoundaryEditMode] = useState(false);
  const [currentPriceBoundary, setCurrentPriceBoundary] = useState<Partial<PriceBoundaryStrategy>>({});


  // --- Helper for Random Mode Dropdowns ---
  // Derive available Exchanges and Transaction Types from MOCK_MM_ACCOUNTS
  const availableExchanges = Array.from(new Set(MOCK_MM_ACCOUNTS_FULL.map(a => a.exchange)));
  const availableTransTypes = Array.from(new Set(MOCK_MM_ACCOUNTS_FULL.flatMap(a => a.transactionTypes)));


  // --- Handlers: Random Mode ---

  const filteredRandomStrategies = randomStrategies.filter(s => {
      return (
          (randomSearch.taskId === '' || s.taskId.includes(randomSearch.taskId)) &&
          (randomSearch.exchange === '' || s.exchange === randomSearch.exchange) &&
          (randomSearch.pair === '' || s.pair.toLowerCase().includes(randomSearch.pair.toLowerCase())) &&
          (randomSearch.type === '' || s.transactionType === randomSearch.type) &&
          (randomSearch.account === '' || MOCK_MM_ACCOUNTS_SHORT.find(a => a.id === s.account1Id)?.name.includes(randomSearch.account))
      );
  });

  const paginatedRandomStrategies = filteredRandomStrategies.slice((randomPage - 1) * randomItemsPerPage, randomPage * randomItemsPerPage);

  const handleRandomSelectAll = () => {
    if (randomSelectedIds.size === paginatedRandomStrategies.length) {
        setRandomSelectedIds(new Set());
    } else {
        setRandomSelectedIds(new Set(paginatedRandomStrategies.map(s => s.id)));
    }
  };

  const handleRandomSelectOne = (id: string) => {
    const newSet = new Set(randomSelectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setRandomSelectedIds(newSet);
  };

  const handleDeleteRow = (id: string, mode: 'random' | 'follow' | 'orderbook' | 'priceboundary') => {
      if (confirm(t('confirmDeleteMsg', lang))) {
          if (mode === 'random') {
              setRandomStrategies(prev => prev.filter(s => s.id !== id));
          } else if (mode === 'follow') {
              setFollowStrategies(prev => prev.filter(s => s.id !== id));
          } else if (mode === 'orderbook') {
              setOrderBookStrategies(prev => prev.filter(s => s.id !== id));
          } else if (mode === 'priceboundary') {
              setPriceBoundaryStrategies(prev => prev.filter(s => s.id !== id));
          }
      }
  }

  const handleRandomDelete = () => {
      const toDelete = randomStrategies.filter(s => randomSelectedIds.has(s.id));
      const activeStrategies = toDelete.filter(s => s.status === 'running');
      
      if (activeStrategies.length > 0) {
          alert("Cannot delete running strategies. Please stop them first.");
          return;
      }

      if (confirm(t('confirmDeleteMsg', lang))) {
          setRandomStrategies(prev => prev.filter(s => !randomSelectedIds.has(s.id)));
          setRandomSelectedIds(new Set());
      }
  };

  const toggleRandomStatus = (id: string) => {
      setRandomStrategies(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'running' ? 'stopped' : 'running' } : s));
  };

  const openRandomModal = (strategy?: RandomStrategy) => {
      if (strategy) {
          setCurrentRandom({ ...strategy });
          setIsRandomEditMode(true);
      } else {
          setCurrentRandom({ 
              exchange: availableExchanges[0], 
              transactionType: availableTransTypes[0] as TransactionType,
              volatility: 100, // 100% as requested default
              status: 'stopped' 
          });
          setIsRandomEditMode(false);
      }
      setIsRandomModalOpen(true);
  };

  const saveRandomStrategy = () => {
      if (!currentRandom.pair || !currentRandom.account1Id || !currentRandom.account2Id) return;

      const newStrategy: RandomStrategy = {
          id: currentRandom.id || `rs${Date.now()}`,
          taskId: currentRandom.taskId || Math.floor(Math.random() * 1000).toString(),
          exchange: currentRandom.exchange || Exchange.Binance,
          pair: currentRandom.pair,
          transactionType: currentRandom.transactionType || TransactionType.Spot,
          account1Id: currentRandom.account1Id,
          account2Id: currentRandom.account2Id,
          minMakerPrice: Number(currentRandom.minMakerPrice) || 0,
          maxMakerPrice: Number(currentRandom.maxMakerPrice) || 0,
          volatility: Number(currentRandom.volatility) || 100,
          maxQtyList: currentRandom.maxQtyList || '',
          minQtyList: currentRandom.minQtyList || '',
          qtyChangePeriod: Number(currentRandom.qtyChangePeriod) || 0,
          maxOrderInterval: Number(currentRandom.maxOrderInterval) || 0,
          minOrderInterval: Number(currentRandom.minOrderInterval) || 0,
          status: currentRandom.status || 'stopped'
      };

      if (isRandomEditMode) {
          setRandomStrategies(prev => prev.map(s => s.id === newStrategy.id ? newStrategy : s));
      } else {
          setRandomStrategies([...randomStrategies, newStrategy]);
      }
      setIsRandomModalOpen(false);
  };

  // --- Handlers: Follow Mode ---

  const filteredFollowStrategies = followStrategies.filter(s => {
      return (
          (followSearch.taskId === '' || s.taskId.includes(followSearch.taskId)) &&
          (followSearch.exchange === '' || s.exchange === followSearch.exchange) &&
          (followSearch.pair === '' || s.pair.toLowerCase().includes(followSearch.pair.toLowerCase())) &&
          (followSearch.type === '' || s.transactionType === followSearch.type) &&
          (followSearch.account === '' || MOCK_MM_ACCOUNTS_SHORT.find(a => a.id === s.account1Id)?.name.includes(followSearch.account))
      );
  });

  const paginatedFollowStrategies = filteredFollowStrategies.slice((followPage - 1) * followItemsPerPage, followPage * followItemsPerPage);

  const handleFollowSelectAll = () => {
    if (followSelectedIds.size === paginatedFollowStrategies.length) {
        setFollowSelectedIds(new Set());
    } else {
        setFollowSelectedIds(new Set(paginatedFollowStrategies.map(s => s.id)));
    }
  };

  const handleFollowSelectOne = (id: string) => {
    const newSet = new Set(followSelectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setFollowSelectedIds(newSet);
  };

  const handleFollowDelete = () => {
      const toDelete = followStrategies.filter(s => followSelectedIds.has(s.id));
      const activeStrategies = toDelete.filter(s => s.status === 'running');
      
      if (activeStrategies.length > 0) {
          alert("Cannot delete running strategies. Please stop them first.");
          return;
      }
      if (confirm(t('confirmDeleteMsg', lang))) {
          setFollowStrategies(prev => prev.filter(s => !followSelectedIds.has(s.id)));
          setFollowSelectedIds(new Set());
      }
  };

  const toggleFollowStatus = (id: string) => {
      setFollowStrategies(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'running' ? 'stopped' : 'running' } : s));
  };

  const openFollowModal = (strategy?: FollowStrategy) => {
      if (strategy) {
          setCurrentFollow({ ...strategy });
          setIsFollowEditMode(true);
      } else {
          setCurrentFollow({ 
              exchange: Exchange.Binance, 
              transactionType: TransactionType.Spot, 
              followTransactionType: TransactionType.Spot,
              status: 'stopped' 
          });
          setIsFollowEditMode(false);
      }
      setIsFollowModalOpen(true);
  };

  const saveFollowStrategy = () => {
      if (!currentFollow.pair || !currentFollow.weights) return;
      
      // Validate Weights
      const weights = currentFollow.weights.split(/[,，]/).map(w => parseFloat(w.trim()));
      const sum = weights.reduce((a, b) => a + (isNaN(b) ? 0 : b), 0);
      if (Math.abs(sum - 1) > 0.001) {
          alert(t('weightError', lang));
          return;
      }

      const newStrategy: FollowStrategy = {
          id: currentFollow.id || `fs${Date.now()}`,
          taskId: currentFollow.taskId || Math.floor(Math.random() * 1000).toString(),
          exchange: currentFollow.exchange || Exchange.Binance,
          pair: currentFollow.pair,
          transactionType: currentFollow.transactionType || TransactionType.Spot,
          account1Id: currentFollow.account1Id || '',
          account2Id: currentFollow.account2Id || '',
          
          followExchanges: currentFollow.followExchanges || '',
          followPairs: currentFollow.followPairs || '',
          followTransactionType: currentFollow.followTransactionType || TransactionType.Spot,
          weights: currentFollow.weights,
          followChangePeriod: Number(currentFollow.followChangePeriod) || 0,
          
          maxQty: currentFollow.maxQty || '',
          minQty: currentFollow.minQty || '',
          qtyChangePeriod: Number(currentFollow.qtyChangePeriod) || 0,
          maxOrderInterval: Number(currentFollow.maxOrderInterval) || 0,
          minOrderInterval: Number(currentFollow.minOrderInterval) || 0,
          
          status: 'stopped'
      };

      if (isFollowEditMode) {
          setFollowStrategies(prev => prev.map(s => s.id === newStrategy.id ? newStrategy : s));
      } else {
          setFollowStrategies([...followStrategies, newStrategy]);
      }
      setIsFollowModalOpen(false);
  };

  // --- Handlers: Order Book Mode ---

  const filteredOrderBookStrategies = orderBookStrategies.filter(s => {
    return (
        (orderBookSearch.taskId === '' || s.taskId.includes(orderBookSearch.taskId)) &&
        (orderBookSearch.exchange === '' || s.exchange === orderBookSearch.exchange) &&
        (orderBookSearch.pair === '' || s.pair.toLowerCase().includes(orderBookSearch.pair.toLowerCase())) &&
        (orderBookSearch.type === '' || s.transactionType === orderBookSearch.type) &&
        (orderBookSearch.account === '' || MOCK_MM_ACCOUNTS_SHORT.find(a => a.id === s.account1Id)?.name.includes(orderBookSearch.account))
    );
  });

  const paginatedOrderBookStrategies = filteredOrderBookStrategies.slice((orderBookPage - 1) * orderBookItemsPerPage, orderBookPage * orderBookItemsPerPage);

  const handleOrderBookSelectAll = () => {
    if (orderBookSelectedIds.size === paginatedOrderBookStrategies.length) {
        setOrderBookSelectedIds(new Set());
    } else {
        setOrderBookSelectedIds(new Set(paginatedOrderBookStrategies.map(s => s.id)));
    }
  };

  const handleOrderBookSelectOne = (id: string) => {
    const newSet = new Set(orderBookSelectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setOrderBookSelectedIds(newSet);
  };

  const handleOrderBookDelete = () => {
    const toDelete = orderBookStrategies.filter(s => orderBookSelectedIds.has(s.id));
    const activeStrategies = toDelete.filter(s => s.status === 'running');
    
    if (activeStrategies.length > 0) {
        alert("Cannot delete running strategies. Please stop them first.");
        return;
    }
    if (confirm(t('confirmDeleteMsg', lang))) {
        setOrderBookStrategies(prev => prev.filter(s => !orderBookSelectedIds.has(s.id)));
        setOrderBookSelectedIds(new Set());
    }
  };

  const toggleOrderBookStatus = (id: string) => {
    setOrderBookStrategies(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'running' ? 'stopped' : 'running' } : s));
  };

  const openOrderBookModal = (strategy?: OrderBookStrategy) => {
    if (strategy) {
        setCurrentOrderBook({ ...strategy });
        setIsOrderBookEditMode(true);
    } else {
        setCurrentOrderBook({ 
            exchange: Exchange.Binance, 
            transactionType: TransactionType.Spot, 
            volatility: 100,
            status: 'stopped' 
        });
        setIsOrderBookEditMode(false);
    }
    setIsOrderBookModalOpen(true);
  };

  const saveOrderBookStrategy = () => {
    if (!currentOrderBook.pair || !currentOrderBook.account1Id || !currentOrderBook.account2Id) return;

    const newStrategy: OrderBookStrategy = {
        id: currentOrderBook.id || `ob${Date.now()}`,
        taskId: currentOrderBook.taskId || Math.floor(Math.random() * 1000).toString(),
        exchange: currentOrderBook.exchange || Exchange.Binance,
        pair: currentOrderBook.pair,
        transactionType: currentOrderBook.transactionType || TransactionType.Spot,
        account1Id: currentOrderBook.account1Id,
        account2Id: currentOrderBook.account2Id,
        volatility: Number(currentOrderBook.volatility) || 0,
        maxQty: currentOrderBook.maxQty || '',
        minQty: currentOrderBook.minQty || '',
        qtyChangePeriod: Number(currentOrderBook.qtyChangePeriod) || 0,
        maxOrderInterval: Number(currentOrderBook.maxOrderInterval) || 0,
        minOrderInterval: Number(currentOrderBook.minOrderInterval) || 0,
        status: 'stopped'
    };

    if (isOrderBookEditMode) {
        setOrderBookStrategies(prev => prev.map(s => s.id === newStrategy.id ? newStrategy : s));
    } else {
        setOrderBookStrategies([...orderBookStrategies, newStrategy]);
    }
    setIsOrderBookModalOpen(false);
  };

  // --- Handlers: Price Boundary Mode ---

  const filteredPriceBoundaryStrategies = priceBoundaryStrategies.filter(s => {
      return (
          (priceBoundarySearch.taskId === '' || s.taskId.includes(priceBoundarySearch.taskId)) &&
          (priceBoundarySearch.exchange === '' || s.exchange === priceBoundarySearch.exchange) &&
          (priceBoundarySearch.pair === '' || s.pair.toLowerCase().includes(priceBoundarySearch.pair.toLowerCase())) &&
          (priceBoundarySearch.type === '' || s.transactionType === priceBoundarySearch.type) &&
          (priceBoundarySearch.account === '' || MOCK_MM_ACCOUNTS_SHORT.find(a => a.id === s.accountId)?.name.includes(priceBoundarySearch.account))
      );
  });

  const paginatedPriceBoundaryStrategies = filteredPriceBoundaryStrategies.slice((priceBoundaryPage - 1) * priceBoundaryItemsPerPage, priceBoundaryPage * priceBoundaryItemsPerPage);

  const handlePriceBoundarySelectAll = () => {
      if (priceBoundarySelectedIds.size === paginatedPriceBoundaryStrategies.length) {
          setPriceBoundarySelectedIds(new Set());
      } else {
          setPriceBoundarySelectedIds(new Set(paginatedPriceBoundaryStrategies.map(s => s.id)));
      }
  };

  const handlePriceBoundarySelectOne = (id: string) => {
      const newSet = new Set(priceBoundarySelectedIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setPriceBoundarySelectedIds(newSet);
  };

  const handlePriceBoundaryDelete = () => {
      const toDelete = priceBoundaryStrategies.filter(s => priceBoundarySelectedIds.has(s.id));
      const activeStrategies = toDelete.filter(s => s.status === 'running');
      
      if (activeStrategies.length > 0) {
          alert("Cannot delete running strategies. Please stop them first.");
          return;
      }
      if (confirm(t('confirmDeleteMsg', lang))) {
          setPriceBoundaryStrategies(prev => prev.filter(s => !priceBoundarySelectedIds.has(s.id)));
          setPriceBoundarySelectedIds(new Set());
      }
  };

  const togglePriceBoundaryStatus = (id: string) => {
      setPriceBoundaryStrategies(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'running' ? 'stopped' : 'running' } : s));
  };

  const openPriceBoundaryModal = (strategy?: PriceBoundaryStrategy) => {
      if (strategy) {
          setCurrentPriceBoundary({ ...strategy });
          setIsPriceBoundaryEditMode(true);
      } else {
          setCurrentPriceBoundary({ 
              exchange: Exchange.Binance, 
              transactionType: TransactionType.Spot, 
              status: 'stopped' 
          });
          setIsPriceBoundaryEditMode(false);
      }
      setIsPriceBoundaryModalOpen(true);
  };

  const savePriceBoundaryStrategy = () => {
      if (!currentPriceBoundary.pair || !currentPriceBoundary.accountId) return;

      const newStrategy: PriceBoundaryStrategy = {
          id: currentPriceBoundary.id || `pb${Date.now()}`,
          taskId: currentPriceBoundary.taskId || Math.floor(Math.random() * 1000).toString(),
          exchange: currentPriceBoundary.exchange || Exchange.Binance,
          pair: currentPriceBoundary.pair,
          transactionType: currentPriceBoundary.transactionType || TransactionType.Spot,
          accountId: currentPriceBoundary.accountId,
          minMakerPrice: Number(currentPriceBoundary.minMakerPrice) || 0,
          maxMakerPrice: Number(currentPriceBoundary.maxMakerPrice) || 0,
          floatingValue: Number(currentPriceBoundary.floatingValue) || 0,
          maxQty: currentPriceBoundary.maxQty || '',
          minQty: currentPriceBoundary.minQty || '',
          minOrderInterval: Number(currentPriceBoundary.minOrderInterval) || 0,
          maxOrderInterval: Number(currentPriceBoundary.maxOrderInterval) || 0,
          status: 'stopped'
      };

      if (isPriceBoundaryEditMode) {
          setPriceBoundaryStrategies(prev => prev.map(s => s.id === newStrategy.id ? newStrategy : s));
      } else {
          setPriceBoundaryStrategies([...priceBoundaryStrategies, newStrategy]);
      }
      setIsPriceBoundaryModalOpen(false);
  };


  // --- Renderers ---

  const renderKLineSubTabs = () => {
      const tabs = [
          { type: StrategyType.Random, label: t('randomMode', lang) },
          { type: StrategyType.Follow, label: t('followMode', lang) },
          { type: StrategyType.OrderBookMode, label: t('orderBookMode', lang) },
          { type: StrategyType.PriceBoundary, label: t('priceBoundary', lang) },
          { type: StrategyType.SpreadFunding, label: t('fundingRate', lang) },
          { type: StrategyType.CrossExchange, label: t('crossExchange', lang) },
      ];

      return (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
              {tabs.map(tab => (
                  <button
                      key={tab.type}
                      onClick={() => setKlineSubTab(tab.type)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors whitespace-nowrap
                          ${klineSubTab === tab.type 
                              ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50' 
                              : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500'}`}
                  >
                      {tab.label}
                  </button>
              ))}
          </div>
      );
  };

  const renderRandomMode = () => (
      <div className="space-y-4">
          {/* Search Bar */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-wrap gap-4 items-end">
             <Input label={t('taskId', lang)} value={randomSearch.taskId} onChange={e => setRandomSearch({...randomSearch, taskId: e.target.value})} containerClassName="w-24" />
             <Select 
                label={t('exchange', lang)}
                options={[{label: 'All', value: ''}, ...Object.values(Exchange).map(e => ({label: e, value: e}))]}
                value={randomSearch.exchange}
                onChange={e => setRandomSearch({...randomSearch, exchange: e.target.value})}
                containerClassName="w-32"
            />
            <Input label={t('tradingPair', lang)} value={randomSearch.pair} onChange={e => setRandomSearch({...randomSearch, pair: e.target.value})} containerClassName="w-32" />
            <Select 
                label={t('transactionType', lang)}
                options={[{label: 'All', value: ''}, ...Object.values(TransactionType).map(e => ({label: e, value: e}))]}
                value={randomSearch.type}
                onChange={e => setRandomSearch({...randomSearch, type: e.target.value})}
                containerClassName="w-32"
            />
            <Input label={t('account', lang)} value={randomSearch.account} onChange={e => setRandomSearch({...randomSearch, account: e.target.value})} containerClassName="w-32" />
            <div className="flex gap-2 ml-auto">
                <Button variant="secondary" onClick={() => setRandomSearch({taskId:'', exchange:'', pair:'', type:'', account:''})}>
                    <RefreshCw size={16} />
                </Button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex gap-2">
             <Button onClick={() => openRandomModal()} className="flex items-center gap-2">
                 <Plus size={16} /> {t('createStrategy', lang)}
             </Button>
             <Button 
                variant="danger" 
                onClick={handleRandomDelete} 
                disabled={randomSelectedIds.size === 0}
                className="flex items-center gap-2"
             >
                 <Trash2 size={16} /> {t('batchDelete', lang)}
             </Button>
          </div>

          {/* Table */}
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-900 border-b border-slate-800 text-xs uppercase text-slate-400 font-semibold">
                        <tr>
                            <th className="px-4 py-3 w-10 text-left">
                                <button onClick={handleRandomSelectAll} className="text-slate-400 hover:text-white">
                                    {randomSelectedIds.size === paginatedRandomStrategies.length && paginatedRandomStrategies.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                                </button>
                            </th>
                            <th className="px-4 py-3 text-left">{t('taskId', lang)}</th>
                            <th className="px-4 py-3 text-left">{t('exchange', lang)}</th>
                            <th className="px-4 py-3 text-left">{t('pair', lang)}</th>
                            <th className="px-4 py-3 text-left">{t('transactionType', lang)}</th>
                            <th className="px-4 py-3 text-left">{t('account1', lang)}</th>
                            <th className="px-4 py-3 text-left">{t('account2', lang)}</th>
                            <th className="px-4 py-3 text-left">{t('makerPrice', lang)}</th>
                            <th className="px-4 py-3 text-left">{t('volatility', lang)}</th>
                            <th className="px-4 py-3 text-left">{t('orderQty', lang)}</th>
                            <th className="px-4 py-3 text-left">{t('qtyChangePeriod', lang)} (min)</th>
                            <th className="px-4 py-3 text-left">{t('orderInterval', lang)}</th>
                            <th className="px-4 py-3 text-left">{t('orderStatus', lang)}</th>
                            <th className="px-4 py-3 text-right">{t('actions', lang)}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {paginatedRandomStrategies.map(s => {
                            const acc1 = MOCK_MM_ACCOUNTS_SHORT.find(a => a.id === s.account1Id)?.name || s.account1Id;
                            const acc2 = MOCK_MM_ACCOUNTS_SHORT.find(a => a.id === s.account2Id)?.name || s.account2Id;
                            const qtyRangeStr = `${s.minQtyList.replace(/,/g,',')}-${s.maxQtyList.replace(/,/g,',')}`;
                            const timeRangeStr = `${s.minOrderInterval}s-${s.maxOrderInterval}s`;

                            return (
                                <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-4 py-3 text-left">
                                        <button onClick={() => handleRandomSelectOne(s.id)} className={`${randomSelectedIds.has(s.id) ? 'text-indigo-500' : 'text-slate-600'} hover:text-indigo-400`}>
                                            {randomSelectedIds.has(s.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-slate-400 font-mono text-left">{s.taskId}</td>
                                    <td className="px-4 py-3 text-left">{s.exchange}</td>
                                    <td className="px-4 py-3 font-medium text-white text-left">{s.pair}</td>
                                    <td className="px-4 py-3 text-left"><Badge color="blue">{s.transactionType}</Badge></td>
                                    <td className="px-4 py-3 text-xs text-slate-400 max-w-[100px] truncate text-left" title={acc1}>{acc1}</td>
                                    <td className="px-4 py-3 text-xs text-slate-400 max-w-[100px] truncate text-left" title={acc2}>{acc2}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-left">{s.minMakerPrice}-{s.maxMakerPrice}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-left">{(s.volatility * 100).toFixed(0)}%</td>
                                    <td className="px-4 py-3 font-mono text-xs max-w-[150px] truncate text-left" title={qtyRangeStr}>{qtyRangeStr}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-left">{s.qtyChangePeriod} m</td>
                                    <td className="px-4 py-3 font-mono text-xs text-left">{timeRangeStr}</td>
                                    <td className="px-4 py-3 text-left">
                                        <button onClick={() => toggleRandomStatus(s.id)} className="focus:outline-none">
                                            <Badge color={s.status === 'running' ? 'green' : 'red'}>
                                                {s.status === 'running' ? t('running', lang) : t('stopped', lang)}
                                            </Badge>
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => openRandomModal(s)} className="text-indigo-400 hover:text-indigo-300">
                                                <Edit size={16} />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteRow(s.id, 'random')} className="text-red-400 hover:text-red-300">
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <Pagination 
                currentPage={randomPage}
                totalPages={Math.ceil(filteredRandomStrategies.length / randomItemsPerPage)}
                totalItems={filteredRandomStrategies.length}
                itemsPerPage={randomItemsPerPage}
                onPageChange={setRandomPage}
                onItemsPerPageChange={setRandomItemsPerPage}
            />
          </Card>
      </div>
  );

  const renderFollowMode = () => (
      <div className="space-y-4">
          {/* Search Bar */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-wrap gap-4 items-end">
             <Input label={t('taskId', lang)} value={followSearch.taskId} onChange={e => setFollowSearch({...followSearch, taskId: e.target.value})} containerClassName="w-24" />
             <Select 
                label={t('exchange', lang)}
                options={[{label: 'All', value: ''}, ...Object.values(Exchange).map(e => ({label: e, value: e}))]}
                value={followSearch.exchange}
                onChange={e => setFollowSearch({...followSearch, exchange: e.target.value})}
                containerClassName="w-32"
            />
            <Input label={t('tradingPair', lang)} value={followSearch.pair} onChange={e => setFollowSearch({...followSearch, pair: e.target.value})} containerClassName="w-32" />
            <Select 
                label={t('transactionType', lang)}
                options={[{label: 'All', value: ''}, ...Object.values(TransactionType).map(e => ({label: e, value: e}))]}
                value={followSearch.type}
                onChange={e => setFollowSearch({...followSearch, type: e.target.value})}
                containerClassName="w-32"
            />
            <Input label={t('account', lang)} value={followSearch.account} onChange={e => setFollowSearch({...followSearch, account: e.target.value})} containerClassName="w-32" />
            <div className="flex gap-2 ml-auto">
                <Button variant="secondary" onClick={() => setFollowSearch({taskId:'', exchange:'', pair:'', type:'', account:''})}>
                    <Search size={16} />
                </Button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex gap-2">
             <Button onClick={() => openFollowModal()} className="flex items-center gap-2">
                 <Plus size={16} /> {t('createStrategy', lang)}
             </Button>
             <Button 
                variant="danger" 
                onClick={handleFollowDelete} 
                disabled={followSelectedIds.size === 0}
                className="flex items-center gap-2"
             >
                 <Trash2 size={16} /> {t('batchDelete', lang)}
             </Button>
          </div>

          {/* Table */}
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-900 border-b border-slate-800 text-xs uppercase text-slate-400 font-semibold">
                        <tr>
                            <th className="px-4 py-3 w-10">
                                <button onClick={handleFollowSelectAll} className="text-slate-400 hover:text-white">
                                    {followSelectedIds.size === paginatedFollowStrategies.length && paginatedFollowStrategies.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                                </button>
                            </th>
                            <th className="px-4 py-3">{t('taskId', lang)}</th>
                            <th className="px-4 py-3">{t('exchange', lang)}</th>
                            <th className="px-4 py-3">{t('pair', lang)}</th>
                            <th className="px-4 py-3">{t('transactionType', lang)}</th>
                            <th className="px-4 py-3">{t('account1', lang)}</th>
                            <th className="px-4 py-3">{t('account2', lang)}</th>
                            <th className="px-4 py-3">{t('followExchange', lang)}</th>
                            <th className="px-4 py-3">{t('followPair', lang)}</th>
                            <th className="px-4 py-3">{t('followType', lang)}</th>
                            <th className="px-4 py-3">{t('weightRatio', lang)}</th>
                            <th className="px-4 py-3">{t('followChangePeriod', lang)}</th>
                            <th className="px-4 py-3">{t('qtyRange', lang)}</th>
                            <th className="px-4 py-3">{t('qtyChangePeriod', lang)}</th>
                            <th className="px-4 py-3">{t('orderInterval', lang)}</th>
                            <th className="px-4 py-3">{t('status', lang)}</th>
                            <th className="px-4 py-3 text-right">{t('actions', lang)}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {paginatedFollowStrategies.map(s => {
                            const acc1 = MOCK_MM_ACCOUNTS_SHORT.find(a => a.id === s.account1Id)?.name || s.account1Id;
                            const acc2 = MOCK_MM_ACCOUNTS_SHORT.find(a => a.id === s.account2Id)?.name || s.account2Id;
                            const timeRangeStr = `${s.minOrderInterval}s-${s.maxOrderInterval}s`;
                            const qtyRangeStr = `${s.minQty}-${s.maxQty}`;

                            return (
                                <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <button onClick={() => handleFollowSelectOne(s.id)} className={`${followSelectedIds.has(s.id) ? 'text-indigo-500' : 'text-slate-600'} hover:text-indigo-400`}>
                                            {followSelectedIds.has(s.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-slate-400 font-mono">{s.taskId}</td>
                                    <td className="px-4 py-3">{s.exchange}</td>
                                    <td className="px-4 py-3 font-medium text-white">{s.pair}</td>
                                    <td className="px-4 py-3"><Badge color="blue">{s.transactionType}</Badge></td>
                                    <td className="px-4 py-3 text-xs text-slate-400 max-w-[100px] truncate" title={acc1}>{acc1}</td>
                                    <td className="px-4 py-3 text-xs text-slate-400 max-w-[100px] truncate" title={acc2}>{acc2}</td>
                                    <td className="px-4 py-3 text-xs text-slate-300 max-w-[100px] truncate" title={s.followExchanges}>{s.followExchanges}</td>
                                    <td className="px-4 py-3 text-xs text-slate-300 max-w-[100px] truncate" title={s.followPairs}>{s.followPairs}</td>
                                    <td className="px-4 py-3 text-xs"><Badge color="gray">{s.followTransactionType}</Badge></td>
                                    <td className="px-4 py-3 text-xs font-mono">{s.weights}</td>
                                    <td className="px-4 py-3 text-xs font-mono">{s.followChangePeriod}</td>
                                    <td className="px-4 py-3 font-mono text-xs">{qtyRangeStr}</td>
                                    <td className="px-4 py-3 font-mono text-xs">{s.qtyChangePeriod}</td>
                                    <td className="px-4 py-3 font-mono text-xs">{timeRangeStr}</td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => toggleFollowStatus(s.id)} className="focus:outline-none">
                                            <Badge color={s.status === 'running' ? 'green' : 'gray'}>
                                                {s.status === 'running' ? t('running', lang) : t('stopped', lang)}
                                            </Badge>
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => openFollowModal(s)} className="text-indigo-400 hover:text-indigo-300">
                                                <Edit size={16} />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteRow(s.id, 'follow')} className="text-red-400 hover:text-red-300">
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <Pagination 
                currentPage={followPage}
                totalPages={Math.ceil(filteredFollowStrategies.length / followItemsPerPage)}
                totalItems={filteredFollowStrategies.length}
                itemsPerPage={followItemsPerPage}
                onPageChange={setFollowPage}
                onItemsPerPageChange={setFollowItemsPerPage}
            />
          </Card>
      </div>
  );

  const renderOrderBookMode = () => (
    <div className="space-y-4">
        {/* Search Bar */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-wrap gap-4 items-end">
           <Input label={t('taskId', lang)} value={orderBookSearch.taskId} onChange={e => setOrderBookSearch({...orderBookSearch, taskId: e.target.value})} containerClassName="w-24" />
           <Select 
              label={t('exchange', lang)}
              options={[{label: 'All', value: ''}, ...Object.values(Exchange).map(e => ({label: e, value: e}))]}
              value={orderBookSearch.exchange}
              onChange={e => setOrderBookSearch({...orderBookSearch, exchange: e.target.value})}
              containerClassName="w-32"
          />
          <Input label={t('tradingPair', lang)} value={orderBookSearch.pair} onChange={e => setOrderBookSearch({...orderBookSearch, pair: e.target.value})} containerClassName="w-32" />
          <Select 
              label={t('transactionType', lang)}
              options={[{label: 'All', value: ''}, ...Object.values(TransactionType).map(e => ({label: e, value: e}))]}
              value={orderBookSearch.type}
              onChange={e => setOrderBookSearch({...orderBookSearch, type: e.target.value})}
              containerClassName="w-32"
          />
          <Input label={t('account', lang)} value={orderBookSearch.account} onChange={e => setOrderBookSearch({...orderBookSearch, account: e.target.value})} containerClassName="w-32" />
          <div className="flex gap-2 ml-auto">
              <Button variant="secondary" onClick={() => setOrderBookSearch({taskId:'', exchange:'', pair:'', type:'', account:''})}>
                  <Search size={16} />
              </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex gap-2">
           <Button onClick={() => openOrderBookModal()} className="flex items-center gap-2">
               <Plus size={16} /> {t('createStrategy', lang)}
           </Button>
           <Button 
              variant="danger" 
              onClick={handleOrderBookDelete} 
              disabled={orderBookSelectedIds.size === 0}
              className="flex items-center gap-2"
           >
               <Trash2 size={16} /> {t('batchDelete', lang)}
           </Button>
        </div>

        {/* Table */}
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900 border-b border-slate-800 text-xs uppercase text-slate-400 font-semibold">
                      <tr>
                          <th className="px-4 py-3 w-10">
                              <button onClick={handleOrderBookSelectAll} className="text-slate-400 hover:text-white">
                                  {orderBookSelectedIds.size === paginatedOrderBookStrategies.length && paginatedOrderBookStrategies.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                              </button>
                          </th>
                          <th className="px-4 py-3">{t('taskId', lang)}</th>
                          <th className="px-4 py-3">{t('exchange', lang)}</th>
                          <th className="px-4 py-3">{t('pair', lang)}</th>
                          <th className="px-4 py-3">{t('transactionType', lang)}</th>
                          <th className="px-4 py-3">{t('account1', lang)}</th>
                          <th className="px-4 py-3">{t('account2', lang)}</th>
                          <th className="px-4 py-3">{t('volatility', lang)}</th>
                          <th className="px-4 py-3">{t('qtyRange', lang)}</th>
                          <th className="px-4 py-3">{t('qtyChangePeriod', lang)}</th>
                          <th className="px-4 py-3">{t('orderInterval', lang)}</th>
                          <th className="px-4 py-3">{t('status', lang)}</th>
                          <th className="px-4 py-3 text-right">{t('actions', lang)}</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                      {paginatedOrderBookStrategies.map(s => {
                          const acc1 = MOCK_MM_ACCOUNTS_SHORT.find(a => a.id === s.account1Id)?.name || s.account1Id;
                          const acc2 = MOCK_MM_ACCOUNTS_SHORT.find(a => a.id === s.account2Id)?.name || s.account2Id;
                          const qtyRangeStr = `${s.minQty}-${s.maxQty}`;
                          const timeRangeStr = `${s.minOrderInterval}s-${s.maxOrderInterval}s`;

                          return (
                              <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                                  <td className="px-4 py-3">
                                      <button onClick={() => handleOrderBookSelectOne(s.id)} className={`${orderBookSelectedIds.has(s.id) ? 'text-indigo-500' : 'text-slate-600'} hover:text-indigo-400`}>
                                          {orderBookSelectedIds.has(s.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                                      </button>
                                  </td>
                                  <td className="px-4 py-3 text-slate-400 font-mono">{s.taskId}</td>
                                  <td className="px-4 py-3">{s.exchange}</td>
                                  <td className="px-4 py-3 font-medium text-white">{s.pair}</td>
                                  <td className="px-4 py-3"><Badge color="blue">{s.transactionType}</Badge></td>
                                  <td className="px-4 py-3 text-xs text-slate-400 max-w-[100px] truncate" title={acc1}>{acc1}</td>
                                  <td className="px-4 py-3 text-xs text-slate-400 max-w-[100px] truncate" title={acc2}>{acc2}</td>
                                  <td className="px-4 py-3 font-mono text-xs">{(s.volatility * 100).toFixed(0)}%</td>
                                  <td className="px-4 py-3 font-mono text-xs">{qtyRangeStr}</td>
                                  <td className="px-4 py-3 font-mono text-xs">{s.qtyChangePeriod} m</td>
                                  <td className="px-4 py-3 font-mono text-xs">{timeRangeStr}</td>
                                  <td className="px-4 py-3">
                                      <button onClick={() => toggleOrderBookStatus(s.id)} className="focus:outline-none">
                                          <Badge color={s.status === 'running' ? 'green' : 'gray'}>
                                              {s.status === 'running' ? t('running', lang) : t('stopped', lang)}
                                          </Badge>
                                      </button>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                      <div className="flex justify-end gap-2">
                                          <Button variant="ghost" size="sm" onClick={() => openOrderBookModal(s)} className="text-indigo-400 hover:text-indigo-300">
                                              <Edit size={16} />
                                          </Button>
                                          <Button variant="ghost" size="sm" onClick={() => handleDeleteRow(s.id, 'orderbook')} className="text-red-400 hover:text-red-300">
                                              <Trash2 size={16} />
                                          </Button>
                                      </div>
                                  </td>
                              </tr>
                          );
                      })}
                  </tbody>
              </table>
          </div>
          <Pagination 
              currentPage={orderBookPage}
              totalPages={Math.ceil(filteredOrderBookStrategies.length / orderBookItemsPerPage)}
              totalItems={filteredOrderBookStrategies.length}
              itemsPerPage={orderBookItemsPerPage}
              onPageChange={setOrderBookPage}
              onItemsPerPageChange={setOrderBookItemsPerPage}
          />
        </Card>
    </div>
  );

  const renderPriceBoundaryMode = () => (
      <div className="space-y-4">
          {/* Search Bar */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-wrap gap-4 items-end">
             <Input label={t('taskId', lang)} value={priceBoundarySearch.taskId} onChange={e => setPriceBoundarySearch({...priceBoundarySearch, taskId: e.target.value})} containerClassName="w-24" />
             <Select 
                label={t('exchange', lang)}
                options={[{label: 'All', value: ''}, ...Object.values(Exchange).map(e => ({label: e, value: e}))]}
                value={priceBoundarySearch.exchange}
                onChange={e => setPriceBoundarySearch({...priceBoundarySearch, exchange: e.target.value})}
                containerClassName="w-32"
            />
            <Input label={t('tradingPair', lang)} value={priceBoundarySearch.pair} onChange={e => setPriceBoundarySearch({...priceBoundarySearch, pair: e.target.value})} containerClassName="w-32" />
            <Select 
                label={t('transactionType', lang)}
                options={[{label: 'All', value: ''}, ...Object.values(TransactionType).map(e => ({label: e, value: e}))]}
                value={priceBoundarySearch.type}
                onChange={e => setPriceBoundarySearch({...priceBoundarySearch, type: e.target.value})}
                containerClassName="w-32"
            />
            <Input label={t('account', lang)} value={priceBoundarySearch.account} onChange={e => setPriceBoundarySearch({...priceBoundarySearch, account: e.target.value})} containerClassName="w-32" />
            <div className="flex gap-2 ml-auto">
                <Button variant="secondary" onClick={() => setPriceBoundarySearch({taskId:'', exchange:'', pair:'', type:'', account:''})}>
                    <Search size={16} />
                </Button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex gap-2">
             <Button onClick={() => openPriceBoundaryModal()} className="flex items-center gap-2">
                 <Plus size={16} /> {t('createStrategy', lang)}
             </Button>
             <Button 
                variant="danger" 
                onClick={handlePriceBoundaryDelete} 
                disabled={priceBoundarySelectedIds.size === 0}
                className="flex items-center gap-2"
             >
                 <Trash2 size={16} /> {t('batchDelete', lang)}
             </Button>
          </div>

          {/* Table */}
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-900 border-b border-slate-800 text-xs uppercase text-slate-400 font-semibold">
                        <tr>
                            <th className="px-4 py-3 w-10">
                                <button onClick={handlePriceBoundarySelectAll} className="text-slate-400 hover:text-white">
                                    {priceBoundarySelectedIds.size === paginatedPriceBoundaryStrategies.length && paginatedPriceBoundaryStrategies.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                                </button>
                            </th>
                            <th className="px-4 py-3">{t('taskId', lang)}</th>
                            <th className="px-4 py-3">{t('exchange', lang)}</th>
                            <th className="px-4 py-3">{t('pair', lang)}</th>
                            <th className="px-4 py-3">{t('transactionType', lang)}</th>
                            <th className="px-4 py-3">{t('account', lang)}</th>
                            <th className="px-4 py-3">{t('makerPriceRange', lang)}</th>
                            <th className="px-4 py-3">{t('floatingValue', lang)}</th>
                            <th className="px-4 py-3">{t('qtyRange', lang)}</th>
                            <th className="px-4 py-3">{t('orderInterval', lang)}</th>
                            <th className="px-4 py-3">{t('status', lang)}</th>
                            <th className="px-4 py-3 text-right">{t('actions', lang)}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {paginatedPriceBoundaryStrategies.map(s => {
                            const acc = MOCK_MM_ACCOUNTS_SHORT.find(a => a.id === s.accountId)?.name || s.accountId;
                            const qtyRangeStr = `${s.minQty}-${s.maxQty}`;
                            const timeRangeStr = `${s.minOrderInterval}s-${s.maxOrderInterval}s`;

                            return (
                                <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <button onClick={() => handlePriceBoundarySelectOne(s.id)} className={`${priceBoundarySelectedIds.has(s.id) ? 'text-indigo-500' : 'text-slate-600'} hover:text-indigo-400`}>
                                            {priceBoundarySelectedIds.has(s.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-slate-400 font-mono">{s.taskId}</td>
                                    <td className="px-4 py-3">{s.exchange}</td>
                                    <td className="px-4 py-3 font-medium text-white">{s.pair}</td>
                                    <td className="px-4 py-3"><Badge color="blue">{s.transactionType}</Badge></td>
                                    <td className="px-4 py-3 text-xs text-slate-400 max-w-[100px] truncate" title={acc}>{acc}</td>
                                    <td className="px-4 py-3 font-mono text-xs">{s.minMakerPrice}-{s.maxMakerPrice}</td>
                                    <td className="px-4 py-3 font-mono text-xs">{s.floatingValue}</td>
                                    <td className="px-4 py-3 font-mono text-xs">{qtyRangeStr}</td>
                                    <td className="px-4 py-3 font-mono text-xs">{timeRangeStr}</td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => togglePriceBoundaryStatus(s.id)} className="focus:outline-none">
                                            <Badge color={s.status === 'running' ? 'green' : 'gray'}>
                                                {s.status === 'running' ? t('running', lang) : t('stopped', lang)}
                                            </Badge>
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => openPriceBoundaryModal(s)} className="text-indigo-400 hover:text-indigo-300">
                                                <Edit size={16} />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteRow(s.id, 'priceboundary')} className="text-red-400 hover:text-red-300">
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <Pagination 
                currentPage={priceBoundaryPage}
                totalPages={Math.ceil(filteredPriceBoundaryStrategies.length / priceBoundaryItemsPerPage)}
                totalItems={filteredPriceBoundaryStrategies.length}
                itemsPerPage={priceBoundaryItemsPerPage}
                onPageChange={setPriceBoundaryPage}
                onItemsPerPageChange={setPriceBoundaryItemsPerPage}
            />
          </Card>
      </div>
  );

  return (
    <div className="space-y-6">
      {/* Main Tabs */}
      {/* No Header requested, only tabs */}
      
      {/* Internal Tabs (K-Line / Depth / Wash) - Logic: The parent passes 'activeTab' which sets internalTab.
          If activeTab is 'trade-kline', we show K-Line subs.
      */}

      {internalTab === 'kline' && (
          <div className="mt-2">
             {renderKLineSubTabs()}
             {klineSubTab === StrategyType.Random && renderRandomMode()}
             {klineSubTab === StrategyType.Follow && renderFollowMode()}
             {klineSubTab === StrategyType.OrderBookMode && renderOrderBookMode()}
             {klineSubTab === StrategyType.PriceBoundary && renderPriceBoundaryMode()}
             {![StrategyType.Random, StrategyType.Follow, StrategyType.OrderBookMode, StrategyType.PriceBoundary].includes(klineSubTab) && (
                 <div className="text-center py-20 bg-slate-900/50 border border-dashed border-slate-800 rounded-lg">
                     <p className="text-slate-500">Module {klineSubTab} not implemented yet.</p>
                 </div>
             )}
          </div>
      )}
      
      {internalTab !== 'kline' && (
           <div className="text-center py-20 bg-slate-900/50 border border-dashed border-slate-800 rounded-lg">
                <p className="text-slate-500">Module {internalTab} content placeholder.</p>
           </div>
      )}

      {/* --- Random Mode Modal --- */}
      <Modal
        isOpen={isRandomModalOpen}
        onClose={() => setIsRandomModalOpen(false)}
        title={t('randomMode', lang) + ' ' + t('paramsConfig', lang)}
        footer={
           <>
            <Button variant="ghost" onClick={() => setIsRandomModalOpen(false)}>{t('cancel', lang)}</Button>
            <Button onClick={saveRandomStrategy}>{t('saveConfig', lang)}</Button>
           </>
        }
      >
          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                 <Select 
                    label={t('exchange', lang)} 
                    options={availableExchanges.map(e => ({label: e, value: e}))}
                    value={currentRandom.exchange}
                    onChange={e => setCurrentRandom({...currentRandom, exchange: e.target.value as Exchange})}
                    containerClassName="col-span-1"
                 />
                 <Select 
                    label={t('transactionType', lang)} 
                    options={availableTransTypes.map(e => ({label: e, value: e}))}
                    value={currentRandom.transactionType}
                    onChange={e => setCurrentRandom({...currentRandom, transactionType: e.target.value as TransactionType})}
                    containerClassName="col-span-1"
                 />
                 <Input label={t('tradingPair', lang)} value={currentRandom.pair || ''} onChange={e => setCurrentRandom({...currentRandom, pair: e.target.value})} containerClassName="col-span-2" />
                 
                 <Select 
                    label={t('account1', lang)} 
                    options={MOCK_MM_ACCOUNTS_SHORT.map(a => ({label: a.name, value: a.id}))}
                    value={currentRandom.account1Id}
                    onChange={e => setCurrentRandom({...currentRandom, account1Id: e.target.value})}
                    containerClassName="col-span-1"
                 />
                 <Select 
                    label={t('account2', lang)} 
                    options={MOCK_MM_ACCOUNTS_SHORT.map(a => ({label: a.name, value: a.id}))}
                    value={currentRandom.account2Id}
                    onChange={e => setCurrentRandom({...currentRandom, account2Id: e.target.value})}
                    containerClassName="col-span-1"
                 />
                 
                 <Input label={t('minMakerPrice', lang)} type="number" value={currentRandom.minMakerPrice || ''} onChange={e => setCurrentRandom({...currentRandom, minMakerPrice: Number(e.target.value)})} containerClassName="col-span-1" />
                 <Input label={t('maxMakerPrice', lang)} type="number" value={currentRandom.maxMakerPrice || ''} onChange={e => setCurrentRandom({...currentRandom, maxMakerPrice: Number(e.target.value)})} containerClassName="col-span-1" />
                 
                 <Input label={t('volatility', lang) + ' %'} type="number" value={currentRandom.volatility || ''} onChange={e => setCurrentRandom({...currentRandom, volatility: Number(e.target.value)})} containerClassName="col-span-2" />
                 
                 <Input label={t('minQty', lang) + ' (CSV)'} placeholder="1,2,3" value={currentRandom.minQtyList || ''} onChange={e => setCurrentRandom({...currentRandom, minQtyList: e.target.value})} containerClassName="col-span-1" />
                 <Input label={t('maxQty', lang) + ' (CSV)'} placeholder="2,3,4" value={currentRandom.maxQtyList || ''} onChange={e => setCurrentRandom({...currentRandom, maxQtyList: e.target.value})} containerClassName="col-span-1" />
                 
                 <Input label={t('qtyChangePeriod', lang)} type="number" value={currentRandom.qtyChangePeriod || ''} onChange={e => setCurrentRandom({...currentRandom, qtyChangePeriod: Number(e.target.value)})} containerClassName="col-span-2" />
                 
                 <Input label={t('minOrderInterval', lang)} type="number" value={currentRandom.minOrderInterval || ''} onChange={e => setCurrentRandom({...currentRandom, minOrderInterval: Number(e.target.value)})} containerClassName="col-span-1" />
                 <Input label={t('maxOrderInterval', lang)} type="number" value={currentRandom.maxOrderInterval || ''} onChange={e => setCurrentRandom({...currentRandom, maxOrderInterval: Number(e.target.value)})} containerClassName="col-span-1" />
             </div>
          </div>
      </Modal>

      {/* --- Follow Mode Modal --- */}
      <Modal
        isOpen={isFollowModalOpen}
        onClose={() => setIsFollowModalOpen(false)}
        title={t('followMode', lang) + ' ' + t('paramsConfig', lang)}
        footer={
           <>
            <Button variant="ghost" onClick={() => setIsFollowModalOpen(false)}>{t('cancel', lang)}</Button>
            <Button onClick={saveFollowStrategy}>{t('saveConfig', lang)}</Button>
           </>
        }
      >
          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                 <Select 
                    label={t('exchange', lang)} 
                    options={Object.values(Exchange).map(e => ({label: e, value: e}))}
                    value={currentFollow.exchange}
                    onChange={e => setCurrentFollow({...currentFollow, exchange: e.target.value as Exchange})}
                    containerClassName="col-span-1"
                 />
                 <Select 
                    label={t('transactionType', lang)} 
                    options={Object.values(TransactionType).map(e => ({label: e, value: e}))}
                    value={currentFollow.transactionType}
                    onChange={e => setCurrentFollow({...currentFollow, transactionType: e.target.value as TransactionType})}
                    containerClassName="col-span-1"
                 />
                 <Input label={t('tradingPair', lang)} value={currentFollow.pair || ''} onChange={e => setCurrentFollow({...currentFollow, pair: e.target.value})} containerClassName="col-span-2" />
                 
                 <Select 
                    label={t('account1', lang)} 
                    options={MOCK_MM_ACCOUNTS_SHORT.map(a => ({label: a.name, value: a.id}))}
                    value={currentFollow.account1Id}
                    onChange={e => setCurrentFollow({...currentFollow, account1Id: e.target.value})}
                    containerClassName="col-span-1"
                 />
                 <Select 
                    label={t('account2', lang)} 
                    options={MOCK_MM_ACCOUNTS_SHORT.map(a => ({label: a.name, value: a.id}))}
                    value={currentFollow.account2Id}
                    onChange={e => setCurrentFollow({...currentFollow, account2Id: e.target.value})}
                    containerClassName="col-span-1"
                 />
                 
                 <div className="col-span-2 border-t border-slate-800 my-2"></div>
                 
                 <Input label={t('followExchange', lang) + ' (CSV)'} placeholder="Binance,OKX" value={currentFollow.followExchanges || ''} onChange={e => setCurrentFollow({...currentFollow, followExchanges: e.target.value})} containerClassName="col-span-1" />
                 <Input label={t('followPair', lang) + ' (CSV)'} placeholder="BTC/USDT,BTC-USDT-SWAP" value={currentFollow.followPairs || ''} onChange={e => setCurrentFollow({...currentFollow, followPairs: e.target.value})} containerClassName="col-span-1" />
                 
                 <Select 
                    label={t('followType', lang)} 
                    options={Object.values(TransactionType).map(e => ({label: e, value: e}))}
                    value={currentFollow.followTransactionType}
                    onChange={e => setCurrentFollow({...currentFollow, followTransactionType: e.target.value as TransactionType})}
                    containerClassName="col-span-1"
                 />
                 <Input label={t('weightRatio', lang) + ' (CSV)'} placeholder="0.6,0.4" value={currentFollow.weights || ''} onChange={e => setCurrentFollow({...currentFollow, weights: e.target.value})} containerClassName="col-span-1" />
                 
                 <Input label={t('followChangePeriod', lang)} type="number" value={currentFollow.followChangePeriod || ''} onChange={e => setCurrentFollow({...currentFollow, followChangePeriod: Number(e.target.value)})} containerClassName="col-span-2" />
                 
                 <div className="col-span-2 border-t border-slate-800 my-2"></div>

                 <Input label={t('minQty', lang)} value={currentFollow.minQty || ''} onChange={e => setCurrentFollow({...currentFollow, minQty: e.target.value})} containerClassName="col-span-1" />
                 <Input label={t('maxQty', lang)} value={currentFollow.maxQty || ''} onChange={e => setCurrentFollow({...currentFollow, maxQty: e.target.value})} containerClassName="col-span-1" />
                 
                 <Input label={t('qtyChangePeriod', lang)} type="number" value={currentFollow.qtyChangePeriod || ''} onChange={e => setCurrentFollow({...currentFollow, qtyChangePeriod: Number(e.target.value)})} containerClassName="col-span-2" />
                 
                 <Input label={t('minOrderInterval', lang)} type="number" value={currentFollow.minOrderInterval || ''} onChange={e => setCurrentFollow({...currentFollow, minOrderInterval: Number(e.target.value)})} containerClassName="col-span-1" />
                 <Input label={t('maxOrderInterval', lang)} type="number" value={currentFollow.maxOrderInterval || ''} onChange={e => setCurrentFollow({...currentFollow, maxOrderInterval: Number(e.target.value)})} containerClassName="col-span-1" />
             </div>
          </div>
      </Modal>

      {/* --- Order Book Mode Modal --- */}
      <Modal
        isOpen={isOrderBookModalOpen}
        onClose={() => setIsOrderBookModalOpen(false)}
        title={t('orderBookMode', lang) + ' ' + t('paramsConfig', lang)}
        footer={
           <>
            <Button variant="ghost" onClick={() => setIsOrderBookModalOpen(false)}>{t('cancel', lang)}</Button>
            <Button onClick={saveOrderBookStrategy}>{t('saveConfig', lang)}</Button>
           </>
        }
      >
          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                 <Select 
                    label={t('exchange', lang)} 
                    options={Object.values(Exchange).map(e => ({label: e, value: e}))}
                    value={currentOrderBook.exchange}
                    onChange={e => setCurrentOrderBook({...currentOrderBook, exchange: e.target.value as Exchange})}
                    containerClassName="col-span-1"
                 />
                 <Select 
                    label={t('transactionType', lang)} 
                    options={Object.values(TransactionType).map(e => ({label: e, value: e}))}
                    value={currentOrderBook.transactionType}
                    onChange={e => setCurrentOrderBook({...currentOrderBook, transactionType: e.target.value as TransactionType})}
                    containerClassName="col-span-1"
                 />
                 <Input label={t('tradingPair', lang)} value={currentOrderBook.pair || ''} onChange={e => setCurrentOrderBook({...currentOrderBook, pair: e.target.value})} containerClassName="col-span-2" />
                 
                 <Select 
                    label={t('account1', lang)} 
                    options={MOCK_MM_ACCOUNTS_SHORT.map(a => ({label: a.name, value: a.id}))}
                    value={currentOrderBook.account1Id}
                    onChange={e => setCurrentOrderBook({...currentOrderBook, account1Id: e.target.value})}
                    containerClassName="col-span-1"
                 />
                 <Select 
                    label={t('account2', lang)} 
                    options={MOCK_MM_ACCOUNTS_SHORT.map(a => ({label: a.name, value: a.id}))}
                    value={currentOrderBook.account2Id}
                    onChange={e => setCurrentOrderBook({...currentOrderBook, account2Id: e.target.value})}
                    containerClassName="col-span-1"
                 />
                 
                 <Input label={t('volatility', lang) + ' %'} type="number" value={currentOrderBook.volatility || ''} onChange={e => setCurrentOrderBook({...currentOrderBook, volatility: Number(e.target.value)})} containerClassName="col-span-2" />
                 
                 <Input label={t('minQty', lang)} value={currentOrderBook.minQty || ''} onChange={e => setCurrentOrderBook({...currentOrderBook, minQty: e.target.value})} containerClassName="col-span-1" />
                 <Input label={t('maxQty', lang)} value={currentOrderBook.maxQty || ''} onChange={e => setCurrentOrderBook({...currentOrderBook, maxQty: e.target.value})} containerClassName="col-span-1" />
                 
                 <Input label={t('qtyChangePeriod', lang)} type="number" value={currentOrderBook.qtyChangePeriod || ''} onChange={e => setCurrentOrderBook({...currentOrderBook, qtyChangePeriod: Number(e.target.value)})} containerClassName="col-span-2" />
                 
                 <Input label={t('minOrderInterval', lang)} type="number" value={currentOrderBook.minOrderInterval || ''} onChange={e => setCurrentOrderBook({...currentOrderBook, minOrderInterval: Number(e.target.value)})} containerClassName="col-span-1" />
                 <Input label={t('maxOrderInterval', lang)} type="number" value={currentOrderBook.maxOrderInterval || ''} onChange={e => setCurrentOrderBook({...currentOrderBook, maxOrderInterval: Number(e.target.value)})} containerClassName="col-span-1" />
             </div>
          </div>
      </Modal>

      {/* --- Price Boundary Mode Modal --- */}
      <Modal
        isOpen={isPriceBoundaryModalOpen}
        onClose={() => setIsPriceBoundaryModalOpen(false)}
        title={t('priceBoundary', lang) + ' ' + t('paramsConfig', lang)}
        footer={
           <>
            <Button variant="ghost" onClick={() => setIsPriceBoundaryModalOpen(false)}>{t('cancel', lang)}</Button>
            <Button onClick={savePriceBoundaryStrategy}>{t('saveConfig', lang)}</Button>
           </>
        }
      >
          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                 <Select 
                    label={t('exchange', lang)} 
                    options={Object.values(Exchange).map(e => ({label: e, value: e}))}
                    value={currentPriceBoundary.exchange}
                    onChange={e => setCurrentPriceBoundary({...currentPriceBoundary, exchange: e.target.value as Exchange})}
                    containerClassName="col-span-1"
                 />
                 <Select 
                    label={t('transactionType', lang)} 
                    options={Object.values(TransactionType).map(e => ({label: e, value: e}))}
                    value={currentPriceBoundary.transactionType}
                    onChange={e => setCurrentPriceBoundary({...currentPriceBoundary, transactionType: e.target.value as TransactionType})}
                    containerClassName="col-span-1"
                 />
                 <Input label={t('tradingPair', lang)} value={currentPriceBoundary.pair || ''} onChange={e => setCurrentPriceBoundary({...currentPriceBoundary, pair: e.target.value})} containerClassName="col-span-2" />
                 
                 <Select 
                    label={t('account', lang)} 
                    options={MOCK_MM_ACCOUNTS_SHORT.map(a => ({label: a.name, value: a.id}))}
                    value={currentPriceBoundary.accountId}
                    onChange={e => setCurrentPriceBoundary({...currentPriceBoundary, accountId: e.target.value})}
                    containerClassName="col-span-2"
                 />
                 
                 <Input label={t('minMakerPrice', lang)} type="number" value={currentPriceBoundary.minMakerPrice || ''} onChange={e => setCurrentPriceBoundary({...currentPriceBoundary, minMakerPrice: Number(e.target.value)})} containerClassName="col-span-1" />
                 <Input label={t('maxMakerPrice', lang)} type="number" value={currentPriceBoundary.maxMakerPrice || ''} onChange={e => setCurrentPriceBoundary({...currentPriceBoundary, maxMakerPrice: Number(e.target.value)})} containerClassName="col-span-1" />
                 
                 <Input label={t('floatingValue', lang)} type="number" value={currentPriceBoundary.floatingValue || ''} onChange={e => setCurrentPriceBoundary({...currentPriceBoundary, floatingValue: Number(e.target.value)})} containerClassName="col-span-2" />
                 
                 <Input label={t('minQty', lang)} value={currentPriceBoundary.minQty || ''} onChange={e => setCurrentPriceBoundary({...currentPriceBoundary, minQty: e.target.value})} containerClassName="col-span-1" />
                 <Input label={t('maxQty', lang)} value={currentPriceBoundary.maxQty || ''} onChange={e => setCurrentPriceBoundary({...currentPriceBoundary, maxQty: e.target.value})} containerClassName="col-span-1" />
                 
                 <Input label={t('minOrderInterval', lang)} type="number" value={currentPriceBoundary.minOrderInterval || ''} onChange={e => setCurrentPriceBoundary({...currentPriceBoundary, minOrderInterval: Number(e.target.value)})} containerClassName="col-span-1" />
                 <Input label={t('maxOrderInterval', lang)} type="number" value={currentPriceBoundary.maxOrderInterval || ''} onChange={e => setCurrentPriceBoundary({...currentPriceBoundary, maxOrderInterval: Number(e.target.value)})} containerClassName="col-span-1" />
             </div>
          </div>
      </Modal>

    </div>
  );
};
