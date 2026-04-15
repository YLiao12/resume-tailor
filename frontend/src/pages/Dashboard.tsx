import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, FileText, Trash2, Copy } from 'lucide-react'

interface Resume {
  id: string
  title: string
  content: string
  is_base_resume: boolean
  created_at: string
  updated_at: string
}

const DEFAULT_RESUME: Resume = {
  id: 'default',
  title: 'My Resume',
  content: `# Your Name
**email@example.com** | **123-456-7890** | **LinkedIn** | **GitHub**

## Work Experience
### Software Engineer | Company Name | Jan 2020 - Present
- Developed web applications using React and Node.js
- Collaborated with cross-functional teams to deliver projects on time

## Skills
- Programming Languages: JavaScript, Python
- Frameworks/Tools: React, Node.js, Docker

## Projects
### Project Name
- Description of the project and your role

## Education
### Bachelor's Degree | University Name | 2018
`,
  is_base_resume: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [resumes, setResumes] = useState<Resume[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('resumes')
    if (stored) {
      setResumes(JSON.parse(stored))
    } else {
      // 首次访问，创建默认简历
      setResumes([DEFAULT_RESUME])
      localStorage.setItem('resumes', JSON.stringify([DEFAULT_RESUME]))
    }
  }, [])

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this resume?')) {
      const updated = resumes.filter(r => r.id !== id)
      setResumes(updated)
      localStorage.setItem('resumes', JSON.stringify(updated))
    }
  }

  const handleDuplicate = (resume: Resume, e: React.MouseEvent) => {
    e.stopPropagation()
    const newResume: Resume = {
      ...resume,
      id: Date.now().toString(),
      title: `${resume.title} (Copy)`,
      is_base_resume: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const updated = [...resumes, newResume]
    setResumes(updated)
    localStorage.setItem('resumes', JSON.stringify(updated))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold">Resume Tailor</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/jd-analyzer')}>
              JD Analyzer
            </Button>
            <Button onClick={() => navigate('/resumes/new')}>
              <Plus className="mr-2 h-4 w-4" />
              New Resume
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">My Resumes</h2>
          <p className="text-muted-foreground">
            Manage your resumes and create tailored versions
          </p>
        </div>

        {resumes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No resumes yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first resume to get started
              </p>
              <Button onClick={() => navigate('/resumes/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Resume
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => (
              <Card
                key={resume.id}
                className="cursor-pointer hover:shadow-lg transition-shadow group"
                onClick={() => navigate(`/resumes/${resume.id}/edit`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{resume.title}</CardTitle>
                      <CardDescription>
                        {resume.is_base_resume ? 'Base Resume' : 'Tailored Resume'}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => handleDuplicate(resume, e)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={(e) => handleDelete(resume.id, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Last updated: {new Date(resume.updated_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
