import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, Save, Trash2, Copy, FileDown, Download } from 'lucide-react'
import { exportToPDF, exportToMarkdown, exportToText } from '@/utils/export'
import ReactMarkdown from 'react-markdown'

interface Resume {
  id: string
  title: string
  content: string
  is_base_resume: boolean
  created_at: string
  updated_at: string
}

export default function ResumeEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saveStatus, setSaveStatus] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('resumes')
    if (stored && id) {
      const resumes: Resume[] = JSON.parse(stored)
      const resume = resumes.find(r => r.id === id)
      if (resume) {
        setTitle(resume.title)
        setContent(resume.content)
      }
    }
  }, [id])

  const saveToStorage = (newTitle: string, newContent: string) => {
    const stored = localStorage.getItem('resumes')
    if (stored && id) {
      const resumes: Resume[] = JSON.parse(stored)
      const index = resumes.findIndex(r => r.id === id)
      if (index !== -1) {
        resumes[index] = {
          ...resumes[index],
          title: newTitle,
          content: newContent,
          updated_at: new Date().toISOString(),
        }
        localStorage.setItem('resumes', JSON.stringify(resumes))
      }
    }
  }

  const handleSave = () => {
    setSaveStatus('Saving...')
    saveToStorage(title, content)
    setSaveStatus('Saved!')
    setTimeout(() => setSaveStatus(''), 2000)
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this resume?')) {
      const stored = localStorage.getItem('resumes')
      if (stored && id) {
        const resumes: Resume[] = JSON.parse(stored)
        const updated = resumes.filter(r => r.id !== id)
        localStorage.setItem('resumes', JSON.stringify(updated))
        navigate('/dashboard')
      }
    }
  }

  const handleDuplicate = () => {
    const stored = localStorage.getItem('resumes')
    if (stored && id) {
      const resumes: Resume[] = JSON.parse(stored)
      const original = resumes.find(r => r.id === id)
      if (original) {
        const newResume: Resume = {
          ...original,
          id: Date.now().toString(),
          title: `${original.title} (Copy)`,
          is_base_resume: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        resumes.push(newResume)
        localStorage.setItem('resumes', JSON.stringify(resumes))
        navigate(`/resumes/${newResume.id}/edit`)
      }
    }
  }

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      const element = document.getElementById('resume-preview')
      if (!element) return
      
      const filename = `${title.replace(/\s+/g, '_')}_Resume.pdf`
      await exportToPDF('resume-preview', filename)
    } catch (error) {
      console.error('Export failed:', error)
      alert('PDF export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportMarkdown = () => {
    const filename = `${title.replace(/\s+/g, '_')}_Resume.md`
    exportToMarkdown(content, filename)
  }

  const handleExportText = () => {
    const filename = `${title.replace(/\s+/g, '_')}_Resume.txt`
    exportToText(content, filename)
  }

  // Auto-save on title/content change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title || content) {
        saveToStorage(title, content)
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [title, content])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-64 font-semibold"
              placeholder="Resume Title"
            />
          </div>
          <div className="flex items-center gap-2">
            {saveStatus && (
              <span className={`text-sm ${saveStatus === 'Saved!' ? 'text-green-600' : 'text-muted-foreground'}`}>
                {saveStatus}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={handleDuplicate}>
              <Copy className="h-4 w-4 mr-1" />
              Duplicate
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Edit (Markdown)</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-[calc(100vh-280px)] p-4 font-mono text-sm border rounded-md bg-background resize-none"
              />
            </CardContent>
          </Card>

          {/* Preview with Export */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Preview</CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleExportMarkdown}
                >
                  <Download className="h-4 w-4 mr-1" />
                  MD
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleExportText}
                >
                  <Download className="h-4 w-4 mr-1" />
                  TXT
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleExportPDF}
                  disabled={isExporting}
                >
                  <FileDown className="h-4 w-4 mr-1" />
                  {isExporting ? 'Exporting...' : 'PDF'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                id="resume-preview"
                className="prose prose-sm max-w-none h-[calc(100vh-320px)] overflow-auto p-4 border rounded-md bg-white"
              >
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
