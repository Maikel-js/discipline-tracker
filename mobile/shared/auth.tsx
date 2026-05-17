import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Crypto from 'expo-crypto'
import { useStore } from './store'
import { generateId } from './helpers'
import type { User, AuthSession } from './types'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  updateProfile: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const STORAGE_INDEX = 'discipline_users_index'

async function hashPassword(password: string): Promise<string> {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  )
  return 'sha256_' + digest
}

function userStorageKey(id: string): string {
  return `discipline_user_${id}`
}

async function loadProfile(userId: string): Promise<User | null> {
  try {
    const raw = await AsyncStorage.getItem(userStorageKey(userId))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

async function saveProfile(user: User): Promise<void> {
  await AsyncStorage.setItem(userStorageKey(user.id), JSON.stringify(user))
}

interface IndexEntry {
  id: string
  email: string
  passwordHash: string
}

async function loadIndex(): Promise<IndexEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_INDEX)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

async function saveIndex(entries: IndexEntry[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_INDEX, JSON.stringify(entries))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    settings,
    updateSettings,
    addDisciplineScore,
  } = useStore()

  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const storedSession = await AsyncStorage.getItem('discipline_session')
        if (storedSession) {
          const session: AuthSession = JSON.parse(storedSession)
          if (new Date(session.expiresAt) > new Date()) {
            const profile = await loadProfile(session.userId)
            if (profile) {
              setUser(profile)
            }
          }
        }
      } catch {
        await AsyncStorage.removeItem('discipline_session')
      }
      setIsLoading(false)
    })()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    const index = await loadIndex()
    const entry = index.find(e => e.email.toLowerCase() === email.toLowerCase())

    if (!entry) {
      setIsLoading(false)
      return false
    }

    const passwordHash = await hashPassword(password)
    if (passwordHash !== entry.passwordHash) {
      setIsLoading(false)
      return false
    }

    const profile = await loadProfile(entry.id)
    if (!profile) {
      setIsLoading(false)
      return false
    }

    profile.lastLogin = new Date().toISOString()
    await saveProfile(profile)

    const token = generateId()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    const session: AuthSession = { userId: profile.id, token, expiresAt }
    await AsyncStorage.setItem('discipline_session', JSON.stringify(session))

    setUser(profile)
    setIsLoading(false)
    return true
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true)

    const index = await loadIndex()
    if (index.find(e => e.email.toLowerCase() === email.toLowerCase())) {
      setIsLoading(false)
      return false
    }

    const passwordHash = await hashPassword(password)
    const id = generateId()

    const newUser: User = {
      id,
      email,
      passwordHash,
      name,
      createdAt: new Date().toISOString(),
      disciplineLevel: 1,
      totalScore: 0,
      settings: { ...settings }
    }

    index.push({ id, email, passwordHash })
    await saveIndex(index)
    await saveProfile(newUser)

    const token = generateId()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    const session: AuthSession = { userId: id, token, expiresAt }
    await AsyncStorage.setItem('discipline_session', JSON.stringify(session))

    setUser(newUser)
    addDisciplineScore(10, 'Registro completado')
    setIsLoading(false)
    return true
  }

  const logout = async () => {
    await AsyncStorage.removeItem('discipline_session')
    setUser(null)
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return

    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    await saveProfile(updatedUser)

    if (updates.email) {
      const index = await loadIndex()
      const entry = index.find(e => e.id === user.id)
      if (entry) {
        entry.email = updates.email
        await saveIndex(index)
      }
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
