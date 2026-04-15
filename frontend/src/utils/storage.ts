const STORAGE_VERSION = 1

interface StorageSchema {
  version: number
  resumes: Resume[]
  jds: JD[]
  openrouter_api_key?: string
}

interface Resume {
  id: string
  title: string
  content: string
  is_base_resume: boolean
  created_at: string
  updated_at: string
}

interface JD {
  id: string
  company_name: string
  job_title: string
  raw_content: string
  parsed_keywords: {
    required_skills: string[]
    preferred_skills: string[]
    responsibility_keywords: string[]
    tone_keywords: string[]
  } | null
  created_at: string
}

export function getStorage(): StorageSchema {
  const defaultData: StorageSchema = {
    version: STORAGE_VERSION,
    resumes: [],
    jds: [],
  }

  try {
    const stored = localStorage.getItem('resume_tailor_data')
    if (!stored) return defaultData

    const parsed = JSON.parse(stored)
    
    // Migration: if old format (no version), migrate to new format
    if (!parsed.version) {
      const migrated: StorageSchema = {
        version: STORAGE_VERSION,
        resumes: parsed.resumes || [],
        jds: parsed.jds || [],
        openrouter_api_key: parsed.openrouter_api_key || localStorage.getItem('openrouter_api_key') || undefined,
      }
      setStorage(migrated)
      return migrated
    }

    // Version check
    if (parsed.version !== STORAGE_VERSION) {
      console.warn(`Storage version mismatch: expected ${STORAGE_VERSION}, got ${parsed.version}`)
      // Future: handle version upgrades here
    }

    return { ...defaultData, ...parsed }
  } catch (error) {
    console.error('Failed to parse storage:', error)
    return defaultData
  }
}

export function setStorage(data: Partial<StorageSchema>) {
  const current = getStorage()
  const updated = { ...current, ...data, version: STORAGE_VERSION }
  localStorage.setItem('resume_tailor_data', JSON.stringify(updated))
}

export function getResumes(): Resume[] {
  return getStorage().resumes
}

export function setResumes(resumes: Resume[]) {
  setStorage({ resumes })
}

export function getJDs(): JD[] {
  return getStorage().jds
}

export function setJDs(jds: JD[]) {
  setStorage({ jds })
}

export function getApiKey(): string {
  const storage = getStorage()
  return storage.openrouter_api_key || localStorage.getItem('openrouter_api_key') || ''
}

export function setApiKey(key: string) {
  setStorage({ openrouter_api_key: key })
  // Also set in old location for backward compatibility during transition
  localStorage.setItem('openrouter_api_key', key)
}
