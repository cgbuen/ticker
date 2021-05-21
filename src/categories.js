const BUILD = [
  { type: 'internal-stats', stat: 'build' }
]

const DEFAULTS = [
  { type: 'twitch', stat: 'followers' },
  { type: 'twitch', stat: 'subs' },
  { type: 'twitch', stat: 'bits', rotatingVariants: ['alltime', 'month', 'week'] },
  { type: 'internal-stats', stat: 'chrissucks', rotatingVariants: ['alltime', 'month', 'week'] },
  { type: 'internal-stats', stat: 'charity' },
  { type: 'twitch', stat: 'uptime' },
]

const SPOTIFY = [
  { type: 'spotify', stat: 'currentlyPlaying' }
]

const ACNH = [
  { type: 'acnh', stat: 'neighbors' },
  { type: 'acnh', stat: 'player' },
  { type: 'acnh', stat: 'island' }
]

const SPLATOON_SOLOQ = [
  { type: 'splatoon', stat: 'ranks' },
  { type: 'splatoon', stat: 'gear', variant: 'weapon' },
  { type: 'splatoon', stat: 'gear', variant: 'head' },
  { type: 'splatoon', stat: 'gear', variant: 'clothes' },
  { type: 'splatoon', stat: 'gear', variant: 'shoes' },
  { type: 'splatoon', stat: 'lifetimeWL' },
  { type: 'splatoon', stat: 'weaponStats', rotatingVariants: ['wins', 'ratio', 'turf'] },
  { type: 'splatoon', stat: 'weaponStats', rotatingVariants: ['losses', 'games', 'recent'] }
]

const SPLATOON_LEAGUE = [
  { type: 'splatoon', stat: 'league', variant: 'pair' },
  { type: 'splatoon', stat: 'league', variant: 'team' },
  { type: 'splatoon', stat: 'gear', variant: 'weapon' },
  { type: 'splatoon', stat: 'gear', variant: 'head' },
  { type: 'splatoon', stat: 'gear', variant: 'clothes' },
  { type: 'splatoon', stat: 'gear', variant: 'shoes' },
  { type: 'splatoon', stat: 'lifetimeWL' },
]

const SPLATOON_SALMON = [
  { type: 'splatoon', stat: 'salmonRun', variant: 'overall' },
  { type: 'splatoon', stat: 'salmonRun', variant: 'individual' },
]

export const CATEGORIES = {
  BUILD,
  DEFAULTS,
  SPOTIFY,
  ACNH,
  SPLATOON_SOLOQ,
  SPLATOON_LEAGUE,
  SPLATOON_SALMON,
}
