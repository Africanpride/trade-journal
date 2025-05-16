
// app/journal/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Trade {
  _id: string;
  ticket: string;
  symbol?: string;
  entry?: number;
  exit?: number;
  profit?: number;
  [key: string]: any;
}

const JournalPage: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/trades')
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((data: Trade[]) => setTrades(data))
      .catch((err) => {
        console.error('Fetch trades error:', err);
        setError('Failed to load trades');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading trades…</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Trade Journal</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticket</TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead>Entry</TableHead>
            <TableHead>Exit</TableHead>
            <TableHead>Profit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((t) => (
            <TableRow key={t._id}>
              <TableCell>{t.ticket}</TableCell>
              <TableCell>{t.symbol ?? '-'}</TableCell>
              <TableCell>{t.entry ?? '-'}</TableCell>
              <TableCell>{t.exit ?? '-'}</TableCell>
              <TableCell>{t.profit ?? '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default JournalPage;
