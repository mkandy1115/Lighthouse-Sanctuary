export type AuthRole = 'Admin' | 'Donor'

export interface AuthUser {
  id: number
  username: string
  displayName: string
  role: AuthRole
  supporterId?: number | null
}

export interface LoginResponse {
  token: string
  expiresAtUtc: string
  user: AuthUser
}

const TOKEN_KEY = 'imari_auth_token'
const USER_KEY = 'imari_auth_user'

export function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5057'
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message ?? 'Unable to sign in right now.')
  }

  return data as LoginResponse
}

export interface RegisterDonorRequest {
  firstName: string
  lastName: string
  email: string
  username: string
  password: string
  phone?: string
  country?: string
  region?: string
  acquisitionChannel?: string
}

export async function registerDonor(request: RegisterDonorRequest): Promise<LoginResponse> {
  const response = await fetch(`${getApiBaseUrl()}/api/auth/register-donor`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message ?? 'Unable to create donor account right now.')
  }

  return data as LoginResponse
}

export function saveAuthSession(session: LoginResponse) {
  localStorage.setItem(TOKEN_KEY, session.token)
  localStorage.setItem(USER_KEY, JSON.stringify(session.user))
}

export function getStoredAuthToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredAuthUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getAuthorizationHeaders(): Record<string, string> {
  const token = getStoredAuthToken()
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {}
}
