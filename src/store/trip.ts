import { create } from 'zustand'

export type TripAddress = {
  id: string
  text: string
}

type TripState = {
  addresses: TripAddress[]
  addAddress: (text: string) => void
  updateAddress: (id: string, text: string) => void
  deleteAddress: (id: string) => void
  setAddresses: (list: TripAddress[]) => void
}

export const useTripStore = create<TripState>((set: (fn: (state: TripState) => TripState | Partial<TripState>) => void) => ({
  addresses: [],
  addAddress: (text: string) =>
    set((s) => ({ addresses: [...s.addresses, { id: Math.random().toString(36).slice(2), text }] })),
  updateAddress: (id: string, text: string) =>
    set((s) => ({ addresses: s.addresses.map((a) => (a.id === id ? { ...a, text } : a)) })),
  deleteAddress: (id: string) => set((s) => ({ addresses: s.addresses.filter((a) => a.id !== id) })),
  setAddresses: (list: TripAddress[]) => set(() => ({ addresses: list }))
}))
