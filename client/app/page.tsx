'use client';

import { useEffect, useState } from 'react';

interface Trade {
  ticket: number;
  price: number;
  sl: number;
  tp: number;
  symbol: string;
  time: number;
  type: string;
  volume: number;
  comment?: string;
}

export default function Home() {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    fetch('http://127.0.0.1:3002/trades')
      .then((res) => res.json())
      .then((data) => setTrades(data));
  }, []);

  const updateComment = async (ticket: number, newComment: string) => {
    const trade = trades.find((t) => t.ticket === ticket);
    if (!trade) return;

    const updated = { ...trade, comment: newComment };

    await fetch('http://127.0.0.1:3002/trades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });

    setTrades((prev) =>
      prev.map((t) => (t.ticket === ticket ? updated : t))
    );
  };

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Personal Trading Journal</h1>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Symbol</th>
              <th>Type</th>
              <th>Price</th>
              <th>SL</th>
              <th>TP</th>
              <th>Volume</th>
              <th>Time</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.ticket}>
                <td>{trade.ticket}</td>
                <td>{trade.symbol}</td>
                <td>{trade.type}</td>
                <td>{trade.price.toFixed(3)}</td>
                <td>{trade.sl.toFixed(3)}</td>
                <td>{trade.tp.toFixed(3)}</td>
                <td>{trade.volume}</td>
                <td>
                  {new Date(trade.time * 1000).toLocaleString('en-GB', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </td>
                <td>
                  <input
                    type="text"
                    defaultValue={trade.comment || ''}
                    onBlur={(e) => updateComment(trade.ticket, e.target.value)}
                    style={{ width: '100%' }}
                    placeholder="Add comment"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
