import { create } from 'zustand'
import type { UserProfile } from '@/lib/types'
import { getProfile, updateProfile } from '@/lib/actions/profile'

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
      const result = await getProfile()
      
      if (!result.success) {
        if (result.error === '로그인이 필요합니다') {
          set({ currentUser: null, isLoading: false })
          return
        }
        throw new Error(result.error)
      }
      
      set({ currentUser: result.data, isLoading: false })
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
      const result = await updateProfile({
        bio: data.bio,
        socialLinks: data.socialLinks,
      })
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      set({ 
        currentUser: { ...currentUser, ...result.data },
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
