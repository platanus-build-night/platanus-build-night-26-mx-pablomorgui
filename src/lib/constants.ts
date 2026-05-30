export const CATEGORIES = [
  'CAT 1',
  'CAT 1 FRONT',
  'CAT 2',
  'CAT 2 FRONT',
  'CAT 3',
  'CAT 3 FRONT',
  'CAT 4',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CURRENCIES = ['MXN', 'USD', 'EUR', 'CAD'] as const;

export type Currency = (typeof CURRENCIES)[number];

const TEAMS: Record<string, { es: string; flag: string }> = {
  // Group A
  'Mexico': { es: 'México', flag: '🇲🇽' },
  'South Africa': { es: 'Sudáfrica', flag: '🇿🇦' },
  'South Korea': { es: 'Corea del Sur', flag: '🇰🇷' },
  'Czech Republic': { es: 'Rep. Checa', flag: '🇨🇿' },

  // Group B
  'Canada': { es: 'Canadá', flag: '🇨🇦' },
  'Bosnia and herzegovina': { es: 'Bosnia', flag: '🇧🇦' },
  'Bosnia and Herzegovina': { es: 'Bosnia', flag: '🇧🇦' },
  'Qatar': { es: 'Qatar', flag: '🇶🇦' },
  'Switzerland': { es: 'Suiza', flag: '🇨🇭' },

  // Group C
  'Brazil': { es: 'Brasil', flag: '🇧🇷' },
  'Morocco': { es: 'Marruecos', flag: '🇲🇦' },
  'Haiti': { es: 'Haití', flag: '🇭🇹' },
  'Scotland': { es: 'Escocia', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },

  // Group D
  'United States': { es: 'EE.UU.', flag: '🇺🇸' },
  'USA': { es: 'EE.UU.', flag: '🇺🇸' },
  'Paraguay': { es: 'Paraguay', flag: '🇵🇾' },
  'Australia': { es: 'Australia', flag: '🇦🇺' },
  'Turkey': { es: 'Turquía', flag: '🇹🇷' },

  // Group E
  'Germany': { es: 'Alemania', flag: '🇩🇪' },
  'Curacao': { es: 'Curazao', flag: '🇨🇼' },
  'Ivory Coast': { es: 'Costa de Marfil', flag: '🇨🇮' },
  'Ecuador': { es: 'Ecuador', flag: '🇪🇨' },

  // Group F
  'Netherlands': { es: 'Holanda', flag: '🇳🇱' },
  'Japan': { es: 'Japón', flag: '🇯🇵' },
  'Sweden': { es: 'Suecia', flag: '🇸🇪' },
  'Tunisia': { es: 'Túnez', flag: '🇹🇳' },

  // Group G
  'Belgium': { es: 'Bélgica', flag: '🇧🇪' },
  'Egypt': { es: 'Egipto', flag: '🇪🇬' },
  'Iran': { es: 'Irán', flag: '🇮🇷' },
  'New Zealand': { es: 'Nueva Zelanda', flag: '🇳🇿' },

  // Group H
  'Spain': { es: 'España', flag: '🇪🇸' },
  'Cape Verde': { es: 'Cabo Verde', flag: '🇨🇻' },
  'Saudi Arabia': { es: 'Arabia Saudita', flag: '🇸🇦' },
  'Uruguay': { es: 'Uruguay', flag: '🇺🇾' },

  // Group I
  'France': { es: 'Francia', flag: '🇫🇷' },
  'Senegal': { es: 'Senegal', flag: '🇸🇳' },
  'Congo': { es: 'Congo', flag: '🇨🇬' },
  'Norway': { es: 'Noruega', flag: '🇳🇴' },

  // Group J
  'Argentina': { es: 'Argentina', flag: '🇦🇷' },
  'Algeria': { es: 'Argelia', flag: '🇩🇿' },
  'Austria': { es: 'Austria', flag: '🇦🇹' },
  'Jordan': { es: 'Jordania', flag: '🇯🇴' },

  // Group K
  'Portugal': { es: 'Portugal', flag: '🇵🇹' },
  'Uzbekistan': { es: 'Uzbekistán', flag: '🇺🇿' },
  'Colombia': { es: 'Colombia', flag: '🇨🇴' },

  // Group L
  'England': { es: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  'Croatia': { es: 'Croacia', flag: '🇭🇷' },
  'Ghana': { es: 'Ghana', flag: '🇬🇭' },
  'Panama': { es: 'Panamá', flag: '🇵🇦' },

  // Others
  'Chile': { es: 'Chile', flag: '🇨🇱' },
  'Peru': { es: 'Perú', flag: '🇵🇪' },
  'Venezuela': { es: 'Venezuela', flag: '🇻🇪' },
  'Bolivia': { es: 'Bolivia', flag: '🇧🇴' },
  'Italy': { es: 'Italia', flag: '🇮🇹' },
  'Poland': { es: 'Polonia', flag: '🇵🇱' },
  'Denmark': { es: 'Dinamarca', flag: '🇩🇰' },
  'Serbia': { es: 'Serbia', flag: '🇷🇸' },
  'Wales': { es: 'Gales', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  'Ukraine': { es: 'Ucrania', flag: '🇺🇦' },
  'Nigeria': { es: 'Nigeria', flag: '🇳🇬' },
  'Cameroon': { es: 'Camerún', flag: '🇨🇲' },
  'Honduras': { es: 'Honduras', flag: '🇭🇳' },
  'Costa Rica': { es: 'Costa Rica', flag: '🇨🇷' },
  'Jamaica': { es: 'Jamaica', flag: '🇯🇲' },
  'El Salvador': { es: 'El Salvador', flag: '🇸🇻' },
  'Greece': { es: 'Grecia', flag: '🇬🇷' },
  'Romania': { es: 'Rumania', flag: '🇷🇴' },
  'Hungary': { es: 'Hungría', flag: '🇭🇺' },
  'Slovenia': { es: 'Eslovenia', flag: '🇸🇮' },
  'Slovakia': { es: 'Eslovaquia', flag: '🇸🇰' },
  'Finland': { es: 'Finlandia', flag: '🇫🇮' },
  'Iceland': { es: 'Islandia', flag: '🇮🇸' },
  'Ireland': { es: 'Irlanda', flag: '🇮🇪' },
  'Mali': { es: 'Mali', flag: '🇲🇱' },
  'Burkina Faso': { es: 'Burkina Faso', flag: '🇧🇫' },
  'DR Congo': { es: 'RD Congo', flag: '🇨🇩' },
  'Kenya': { es: 'Kenia', flag: '🇰🇪' },
  'Tanzania': { es: 'Tanzania', flag: '🇹🇿' },
  'Uganda': { es: 'Uganda', flag: '🇺🇬' },
  'Zambia': { es: 'Zambia', flag: '🇿🇲' },
  'Zimbabwe': { es: 'Zimbabue', flag: '🇿🇼' },
  'China': { es: 'China', flag: '🇨🇳' },
  'India': { es: 'India', flag: '🇮🇳' },
  'Thailand': { es: 'Tailandia', flag: '🇹🇭' },
  'Vietnam': { es: 'Vietnam', flag: '🇻🇳' },
  'Indonesia': { es: 'Indonesia', flag: '🇮🇩' },
  'Malaysia': { es: 'Malasia', flag: '🇲🇾' },
  'Iraq': { es: 'Irak', flag: '🇮🇶' },
  'Syria': { es: 'Siria', flag: '🇸🇾' },
  'Palestine': { es: 'Palestina', flag: '🇵🇸' },
  'UAE': { es: 'EAU', flag: '🇦🇪' },
  'United Arab Emirates': { es: 'EAU', flag: '🇦🇪' },
  'Bahrain': { es: 'Bahréin', flag: '🇧🇭' },
  'Oman': { es: 'Omán', flag: '🇴🇲' },
  'Cuba': { es: 'Cuba', flag: '🇨🇺' },
  'Trinidad and Tobago': { es: 'Trinidad y Tobago', flag: '🇹🇹' },
  'Guatemala': { es: 'Guatemala', flag: '🇬🇹' },
};

export function getTeamFlag(team: string | null | undefined): string {
  if (!team) return '';
  return TEAMS[team]?.flag ?? '';
}

export function getTeamNameEs(team: string | null | undefined): string {
  if (!team) return '';
  return TEAMS[team]?.es ?? team;
}

export function formatMatchDisplay(match: {
  match_number: number;
  home_team: string | null;
  away_team: string | null;
  home_placeholder: string | null;
  away_placeholder: string | null;
}): string {
  const num = `M${match.match_number}`;

  if (match.home_team && match.away_team) {
    const homeFlag = getTeamFlag(match.home_team);
    const homeName = getTeamNameEs(match.home_team);
    const awayFlag = getTeamFlag(match.away_team);
    const awayName = getTeamNameEs(match.away_team);
    const homePart = homeFlag ? `${homeFlag} ${homeName}` : homeName;
    const awayPart = awayFlag ? `${awayFlag} ${awayName}` : awayName;
    return `${num} ${homePart} vs ${awayPart}`;
  }

  const home = match.home_placeholder ?? '?';
  const away = match.away_placeholder ?? '?';
  return `${num} ${home} vs ${away}`;
}

export const CITIES = [
  'Atlanta',
  'Boston',
  'Dallas',
  'Guadalajara',
  'Houston',
  'Kansas City',
  'Los Angeles',
  'Mexico City',
  'Miami',
  'Monterrey',
  'New York/New Jersey',
  'Philadelphia',
  'San Francisco',
  'Seattle',
  'Toronto',
  'Vancouver',
] as const;

export const STAGES = [
  { value: 'group', label: 'Fase de grupos' },
  { value: 'r32', label: 'Dieciseisavos' },
  { value: 'r16', label: 'Octavos' },
  { value: 'qf', label: 'Cuartos' },
  { value: 'sf', label: 'Semifinales' },
  { value: 'third', label: 'Tercer lugar' },
  { value: 'final', label: 'Final' },
] as const;
