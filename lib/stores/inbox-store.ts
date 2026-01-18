import { create } from 'zustand'
import type { Question } from '@/lib/types'
import { createAnswer } from '@/lib/actions/answers'

interface InboxState {
  questions: Question[]
  isLoading: boolean
  error: string | null
  
  setQuestions: (questions: Question[]) => void
  removeQuestion: (questionId: number) => void
  answerQuestion: (questionId: number, content: string) => Promise<boolean>
}

export const useInboxStore = create<InboxState>((set, get) => ({
  questions: [],
  isLoading: false,
  error: null,
  
  setQuestions: (questions) => {
    set({ questions })
  },
  
  removeQuestion: (questionId) => {
    set((state) => ({
      questions: state.questions.filter((q) => q.id !== questionId)
    }))
  },
  
  answerQuestion: async (questionId, content) => {
    set({ isLoading: true, error: null })
    
    try {
      const result = await createAnswer({ questionId, content })
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      get().removeQuestion(questionId)
      set({ isLoading: false })
      return true
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false 
      })
      return false
    }
  },
}))
