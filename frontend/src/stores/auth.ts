import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/services/api'

interface User {
  id: string
  email: string
  full_name: string | null
  is_active: boolean
  has_api_key: boolean
}

interface AuthState {
  // 状态
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // 方法
  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName?: string) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      initialize: async () => {
        const token = localStorage.getItem('access_token')
        if (!token) {
          set({ isLoading: false })
          return
        }

        try {
          // TODO: 调用 /auth/me 获取用户信息
          // const response = await authApi.getMe()
          // set({ user: response.data, isAuthenticated: true, isLoading: false })
          set({ isLoading: false })
        } catch (error) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          set({ isLoading: false })
        }
      },

      login: async (email: string, password: string) => {
        const response = await authApi.login(email, password)
        const { access_token, refresh_token } = response.data
        
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', refresh_token)
        
        // TODO: 获取用户信息
        set({ isAuthenticated: true })
      },

      register: async (email: string, password: string, fullName?: string) => {
        await authApi.register(email, password, fullName)
        // 注册成功后自动登录
        await get().login(email, password)
      },

      logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ user: null, isAuthenticated: false })
        window.location.href = '/login'
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
