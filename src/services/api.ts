import axios from 'axios'
import Constants from 'expo-constants'

const extra = (Constants?.expoConfig?.extra || Constants?.manifest?.extra) as { API_BASE_URL?: string }

const getBaseUrl = () => {
  if (extra?.API_BASE_URL) return extra.API_BASE_URL
  
  const hostUri = Constants?.expoConfig?.hostUri || Constants?.manifest?.hostUri
  if (hostUri) {
    const ip = hostUri.split(':')[0]
    return `http://${ip}:3001`
  }
  
  return 'http://localhost:3001'
}

const baseURL = getBaseUrl()

console.log('API Base URL:', baseURL)

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
export type AuthResponse = { status: string; token: string; user?: { id: string; phone_number: string } }
export type OptimizeRequest = { origin: { lat: number; lng: number }; destinations: string[] }
export type OptimizeItem = { address: string; distance_km: number; duration: string }

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const r = await api.post('/api/auth/login', payload)
  return r.data
}

export async function register(payload: LoginPayload): Promise<AuthResponse> {
  const r = await api.post('/api/auth/register', payload)
  return r.data
}

export async function optimizeRoute(body: OptimizeRequest, token: string): Promise<{ status: string; data: OptimizeItem[] }> {
  const r = await api.post('/api/optimize-route', body, { headers: { Authorization: `Bearer ${token}` } })
  console.log('Optimize Route Response:', r.data)
  return r.data
}

export default api
