import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft } from 'lucide-react'

interface Resume {
  id: string
  title: string
  content: string
  is_base_resume: boolean
  created_at: string
  updated_at: string
}

const DEFAULT_TEMPLATE = `# Your Name
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
`

export default function ResumeNew() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState(DEFAULT_TEMPLATE)
  const [isBase, setIsBase] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newResume: Resume = {
      id: Date.now().toString(),
      title: title || 'Untitled Resume',
      content,
      is_base_resume: isBase,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const stored = localStorage.getItem('resumes')
    const resumes = stored ? JSON.parse(stored) : []
    resumes.push(newResume)
    localStorage.setItem('resumes', JSON.stringify(resumes))

    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-lg font-semibold">New Resume</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resume Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Software Engineer Resume"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isBase"
                  checked={isBase}
                  onChange={(e) => setIsBase(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isBase" className="text-sm font-normal">
                  This is my base resume (used for tailoring)
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content (Markdown)</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-96 p-4 font-mono text-sm border rounded-md bg-background resize-y"
                placeholder="Enter your resume in Markdown format..."
                required
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            <Button type="submit">
              Create Resume
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
