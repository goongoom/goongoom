import { create } from 'zustand'
import type { UserProfile } from '@/lib/types'

interface UserState {
  currentUser: UserProfile | null
  isLoading: boolean
  error: string | null
  
  fetchCurrentUser: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
  clearUser: () => void
}

export const useUserStore = create<UserState>((set, get) => ({
  currentUser: null,
  isLoading: false,
  error: null,
  
  fetchCurrentUser: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetch('/api/profile')
      
      if (!response.ok) {
        if (response.status === 401) {
          set({ currentUser: null, isLoading: false })
          return
        }
        throw new Error('Failed to fetch user')
      }
      
      const user = await response.json()
      set({ currentUser: user, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false 
      })
    }
  },
  
  updateProfile: async (data) => {
    const { currentUser } = get()
    if (!currentUser) return
    
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update profile')
      }
      
      const updated = await response.json()
      set({ 
        currentUser: { ...currentUser, ...updated },
        isLoading: false 
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false 
      })
    }
  },
  
  clearUser: () => {
    set({ currentUser: null, isLoading: false, error: null })
  },
}))
