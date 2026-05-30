'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import { CITIES, STAGES, getTeamNameEs } from '@/lib/constants';
import { Search } from 'lucide-react';

type FiltersProps = {
  teams: string[];
};

export function Filters({ teams }: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCity = searchParams.get('city') || '';
  const currentStage = searchParams.get('stage') || '';
  const currentTeam = searchParams.get('team') || '';
  const currentSearch = searchParams.get('q') || '';

  const [searchValue, setSearchValue] = useState(currentSearch);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSearchValue(currentSearch);
  }, [currentSearch]);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/inteligencia?${params.toString()}`);
  }

  function handleSearchChange(value: string) {
    setSearchValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateFilter('q', value);
    }, 300);
  }

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {/* Search */}
      <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
        <label className="text-xs font-semibold uppercase text-muted-foreground">Buscar</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Ej: M25, Mexico, CDMX"
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* City filter */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold uppercase text-muted-foreground">Ciudad</label>
        <Select value={currentCity || 'all'} onValueChange={(v) => updateFilter('city', v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {CITIES.map((city) => (
              <SelectItem key={city} value={city}>
                {city === 'Mexico City' ? 'CDMX' : city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stage filter */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold uppercase text-muted-foreground">Fase</label>
        <Select value={currentStage || 'all'} onValueChange={(v) => updateFilter('stage', v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {STAGES.map((stage) => (
              <SelectItem key={stage.value} value={stage.value}>
                {stage.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Team filter */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold uppercase text-muted-foreground">Equipo</label>
        <Combobox
          options={[
            { value: 'all', label: 'Todos' },
            ...teams.map((team) => ({
              value: team,
              label: getTeamNameEs(team) || team,
              searchTerms: team,
            })),
          ]}
          value={currentTeam || 'all'}
          onValueChange={(v) => updateFilter('team', v)}
          placeholder="Todos"
          searchPlaceholder="Buscar equipo..."
          className="w-[180px]"
        />
      </div>
    </div>
  );
}
