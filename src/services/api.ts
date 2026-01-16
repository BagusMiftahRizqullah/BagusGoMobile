import axios from 'axios'
import Constants from 'expo-constants'

type ExtraConfig = {
  API_BASE_URL?: string
  BASE_API?: string
}

const extra = (Constants?.expoConfig?.extra || Constants?.manifest?.extra) as ExtraConfig

const getBaseUrl = (): string => {
  if (extra?.BASE_API) return extra.BASE_API
  if (extra?.API_BASE_URL) return extra.API_BASE_URL

  const hostUri = Constants?.expoConfig?.hostUri || Constants?.manifest?.hostUri
  if (hostUri) {
    const ip = hostUri.split(':')[0]
    return `http://${ip}:3001`
  }

  return 'http://localhost:3001'
}

const baseURL = getBaseUrl()

const api = axios.create({ baseURL })

api.interceptors.request.use(request => {
  console.log('Starting Request', request.url)
  const fullUrl = (request.baseURL || '') + (request.url || '')
  console.log('Full URL:', fullUrl)
  return request
})

import { useAuthStore } from '@store/auth'

api.interceptors.response.use(response => {
  console.log('Response:', response.status)
  return response
}, error => {
  console.log('Response Error:', error.message)
  
  if (error.response?.status === 401) {
    useAuthStore.getState().logout()
  }
  
  return Promise.reject(error)
})

export type LoginPayload = { phone_number: string; password: string }
export type RegisterPayload = LoginPayload & { name?: string }
export type AuthResponse = { status: string; token: string; user?: { id: string; phone_number: string } }
export type OptimizeRequest = { origin: { lat: number; lng: number }; destinations: string[] }
export type OptimizeItem = { address: string; distance_km: number; duration: string }

export type AddressPayload = {
  label: string
  address: string
  lat: number
  lng: number
}

export type Address = AddressPayload & {
  id: string
}

export type AddressListData = {
  items: Address[]
  page: number
  limit: number
  total: number
  hasMore: boolean
}

export type AddressListResponse = {
  status: string
  data: AddressListData
}

export type AddressItemResponse = {
  status: string
  data: Address
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const r = await api.post('/api/auth/login', payload)
  return r.data
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const r = await api.post('/api/auth/register', payload)
  return r.data
}

export async function optimizeRoute(body: OptimizeRequest, token: string): Promise<{ status: string; data: OptimizeItem[] }> {
  const r = await api.post('/api/optimize-route', body, { headers: { Authorization: `Bearer ${token}` } })
  console.log('Optimize Route Response:', r.data)
  return r.data
}

export async function fetchAddresses(page: number, limit: number, token: string): Promise<AddressListData> {
  const r = await api.get<AddressListResponse>('/api/addresses', {
    params: { page, limit },
    headers: { Authorization: `Bearer ${token}` },
  })
  return r.data.data
}

export async function createAddress(payload: AddressPayload, token: string): Promise<Address> {
  const r = await api.post<AddressItemResponse>(
    '/api/addresses',
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return r.data.data
}

export async function updateAddress(id: string, payload: AddressPayload, token: string): Promise<Address> {
  const r = await api.put<AddressItemResponse>(
    `/api/addresses/${id}`,
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return r.data.data
}

export async function deleteAddress(id: string, token: string): Promise<void> {
  await api.delete(`/api/addresses/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export default api
