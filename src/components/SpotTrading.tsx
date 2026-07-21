import React from 'react';
import ManualTrading from './ManualTrading';
import { MarketPair, TradeOrder, UserPortfolio } from '../types';

interface SpotTradingProps {
  lang: 'ar' | 'en';
  activePair: string;
  pairs: MarketPair[];
  
  // Manual Trading Props
  onSubmitOrder: (order: TradeOrder) => void;
  orders: TradeOrder[];
  portfolio: UserPortfolio;
}

export default function SpotTrading(props: SpotTradingProps) {
  const activePairObj = props.pairs.find(p => p.symbol === props.activePair) || props.pairs[0];

  return (
    <div className="space-y-4">
      <ManualTrading
        lang={props.lang}
        activePair={activePairObj}
        onSubmitOrder={props.onSubmitOrder}
        orders={props.orders}
        portfolio={props.portfolio}
      />
    </div>
  );
}

