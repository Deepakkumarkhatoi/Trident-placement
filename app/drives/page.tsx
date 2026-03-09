'use client';

export const dynamic = 'force-dynamic';

import DashboardLayout from '@/components/DashboardLayout';
import DriveCard from '@/components/DriveCard';
import { drivesList } from '@/data/drives';
import { Search, Filter } from 'lucide-react';
import { useState } from 'react';

const allDrives = drivesList;

export default function Drives() {
  const [filter, setFilter] = useState<'All' | 'On-Campus' | 'Virtual'>('All');
  const [search, setSearch] = useState('');

  const filtered = allDrives.filter((d) => {
    const matchType = filter === 'All' || d.type === filter;
    const matchSearch = d.company.toLowerCase().includes(search.toLowerCase()) || d.role.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-display font-bold text-foreground">Placement Drives</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-8">Browse and apply to available placement opportunities.</p>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies or roles..."
            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>
        <div className="flex gap-2">
          {(['All', 'On-Campus', 'Virtual'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                filter === f
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/30'
              }`}
            >
              <Filter className="w-3 h-3 inline mr-1.5" />
              {f}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-4">{filtered.length} drives found</p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((d, i) => (
          <DriveCard key={d.id} {...d} delay={i * 100} />
        ))}
      </div>
    </DashboardLayout>
  );
}
