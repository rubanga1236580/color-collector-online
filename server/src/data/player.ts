export type PlayerData = {
  id: string
  name: string
  coins: number
  energy: number
  energyMax: number
  lastEnergyUpdate: string
  lastSeen: string
  gachaTicket: number
  totalGachaCount: number
  totalPaintCount: number
  gachaLastClaimDate: string
  constellation: {
    red: number
    blue: number
    yellow: number
    green: number
    orange: number
    cyan: number
    purple: number
    brown: number
    ochre: number
    black: number
    white: number
    gray: number
    pink: number
    silver: number
    gold: number
  }
  stocks: {
    red: number
    blue: number
    yellow: number
    green: number
    orange: number
    cyan: number
    purple: number
    brown: number
    ochre: number
    black: number
    white: number
    gray: number
    pink: number
    silver: number
    gold: number
  }
  unlocked?: {
    red: boolean
    blue: boolean
    yellow: boolean
    green: boolean
    orange: boolean
    cyan: boolean
    purple: boolean
    brown: boolean
    ochre: boolean
    black: boolean
    white: boolean
    gray: boolean
    pink: boolean
    silver: boolean
    gold: boolean
  }
  tapCounts: {
    red: number
    blue: number
    yellow: number
    green: number
    orange: number
    cyan: number
    purple: number
    brown: number
    ochre: number
    black: number
    white: number
    gray: number
    pink: number
    silver: number
    gold: number
  }
}

export const playerData: PlayerData = {
  id: "player-001",
  name: "Player",
  coins: 100,
  energy: 0,
  energyMax: 5,
  lastEnergyUpdate: new Date().toISOString(),
  lastSeen: new Date().toISOString(),
  gachaTicket: 0,
  totalGachaCount: 0,
  totalPaintCount: 0,
  gachaLastClaimDate: new Date().toISOString(),
  constellation: {
    red: 0,
    blue: 0,
    yellow: 0,
    green: 0,
    orange: 0,
    cyan: 0,
    purple: 0,
    brown: 0,
    ochre: 0,
    black: 0,
    white: 0,
    gray: 0,
    pink: 0,
    silver: 0,
    gold: 0,
  },
  stocks: {
    red: 0,
    blue: 0,
    yellow: 0,
    green: 0,
    orange: 0,
    cyan: 0,
    purple: 0,
    brown: 0,
    ochre: 0,
    black: 0,
    white: 0,
    gray: 0,
    pink: 0,
    silver: 0,
    gold: 0,
  },
  unlocked: {
    red: false,
    blue: false,
    yellow: false,
    green: false,
    orange: false,
    cyan: false,
    purple: false,
    brown: false,
    ochre: false,
    black: false,
    white: false,
    gray: false,
    pink: false,
    silver: false,
    gold: false,
  },
  tapCounts: {
    red: 0,
    blue: 0,
    yellow: 0,
    green: 0,
    orange: 0,
    cyan: 0,
    purple: 0,
    brown: 0,
    ochre: 0,
    black: 0,
    white: 0,
    gray: 0,
    pink: 0,
    silver: 0,
    gold: 0,
  },
}
