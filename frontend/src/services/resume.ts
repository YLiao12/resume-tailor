import api from './api'

export interface Resume {
  id: string
  user_id: string
  title: string
  content: string
  is_base_resume: boolean
  created_at: string
  updated_at: string
}

export interface ResumeList {
  items: Resume[]
  total: number
}

export interface CreateResumeData {
  title: string
  content: string
  is_base_resume?: boolean
}

export interface UpdateResumeData {
  title?: string
  content?: string
  is_base_resume?: boolean
}

export const resumeApi = {
  list: (skip = 0, limit = 20) =>
    api.get<ResumeList>('/resumes', { params: { skip, limit } }),

  get: (id: string) =>
    api.get<Resume>(`/resumes/${id}`),

  create: (data: CreateResumeData) =>
    api.post<Resume>('/resumes', data),

  update: (id: string, data: UpdateResumeData) =>
    api.put<Resume>(`/resumes/${id}`, data),

  delete: (id: string) =>
    api.delete(`/resumes/${id}`),

  duplicate: (id: string) =>
    api.post<Resume>(`/resumes/${id}/duplicate`),
}

export default resumeApi
