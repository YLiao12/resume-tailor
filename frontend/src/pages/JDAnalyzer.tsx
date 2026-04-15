import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChevronLeft, Sparkles, Loader2, Copy, Check, FileDown } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { exportToPDF } from '@/utils/export'
import { getApiKey } from '@/utils/storage'
import { callOpenRouter } from '@/utils/ai'

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

interface Resume {
  id: string
  title: string
  content: string
  is_base_resume: boolean
}

export default function JDAnalyzer() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [companyName, setCompanyName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [jdContent, setJdContent] = useState('')
  const [jd, setJd] = useState<JD | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [generatedResume, setGeneratedResume] = useState('')
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('jd')
  const [copied, setCopied] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [apiKey, setApiKey] = useState(getApiKey())

  useEffect(() => {
    if (id) {
      const stored = localStorage.getItem('jds')
      if (stored) {
        const jds: JD[] = JSON.parse(stored)
        const found = jds.find(j => j.id === id)
        if (found) {
          setJd(found)
          setCompanyName(found.company_name)
          setJobTitle(found.job_title)
          setJdContent(found.raw_content)
        }
      }
    }
  }, [id])

  const saveJD = () => {
    const newJD: JD = {
      id: id || Date.now().toString(),
      company_name: companyName,
      job_title: jobTitle,
      raw_content: jdContent,
      parsed_keywords: null,
      created_at: new Date().toISOString(),
    }

    const stored = localStorage.getItem('jds')
    const jds: JD[] = stored ? JSON.parse(stored) : []
    
    if (id) {
      const index = jds.findIndex(j => j.id === id)
      if (index !== -1) {
        jds[index] = { ...jds[index], ...newJD }
      }
    } else {
      jds.push(newJD)
    }
    
    localStorage.setItem('jds', JSON.stringify(jds))
    setJd(newJD)
    return newJD
  }

  const analyzeJD = async () => {
    const key = getApiKey()
    if (!key) {
      alert('Please set your OpenRouter API key in settings')
      return
    }

    setIsAnalyzing(true)
    const currentJD = saveJD()

    try {
      const content = await callOpenRouter(
        `You are a professional recruiter. Analyze the following job description and extract key information. Return ONLY valid JSON, no extra text.

JD:
${jdContent}

Return this exact JSON structure:
{
  "job_title": "position title",
  "company_name": "company name or empty string",
  "required_skills": ["skill1", "skill2"],
  "preferred_skills": ["skill1", "skill2"],
  "responsibility_keywords": ["verb phrase1", "verb phrase2"],
  "tone_keywords": ["keyword1", "keyword2"],
  "key_requirements": ["requirement1", "requirement2"]
}`,
        0.3
      )

      const parsed = JSON.parse(content.replace(/```json\n?|```\n?/g, '').trim())

      const updatedJD: JD = {
        ...currentJD,
        parsed_keywords: {
          required_skills: parsed.required_skills || [],
          preferred_skills: parsed.preferred_skills || [],
          responsibility_keywords: parsed.responsibility_keywords || [],
          tone_keywords: parsed.tone_keywords || [],
        },
      }

      const stored = localStorage.getItem('jds')
      const jds: JD[] = stored ? JSON.parse(stored) : []
      const index = jds.findIndex(j => j.id === updatedJD.id)
      if (index !== -1) {
        jds[index] = updatedJD
        localStorage.setItem('jds', JSON.stringify(jds))
        setJd(updatedJD)
      }
    } catch (error) {
      console.error('Analysis failed:', error)
      alert('Analysis failed. Please check your API key and try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateResume = async () => {
    if (!jd?.parsed_keywords) {
      alert('Please analyze the JD first')
      return
    }

    const key = getApiKey()
    if (!key) {
      alert('Please set your OpenRouter API key')
      return
    }

    setIsGenerating(true)

    const storedResumes = localStorage.getItem('resumes')
    const resumes: Resume[] = storedResumes ? JSON.parse(storedResumes) : []
    const baseResume = resumes.find(r => r.is_base_resume) || resumes[0]

    if (!baseResume) {
      alert('Please create a base resume first')
      setIsGenerating(false)
      return
    }

    const keywords = [
      `Required Skills: ${jd.parsed_keywords.required_skills.join(', ')}`,
      `Preferred Skills: ${jd.parsed_keywords.preferred_skills.join(', ')}`,
      `Key Responsibilities: ${jd.parsed_keywords.responsibility_keywords.join(', ')}`,
      `Tone/Style: ${jd.parsed_keywords.tone_keywords.join(', ')}`,
    ].join('\n')

    try {
      const generated = await callOpenRouter(
        `You are an expert resume writer. Given the user's base resume and JD keywords, generate an optimized resume tailored to the target job.

STRICT RULES:
1. Never invent experience, skills, or achievements the user does not have
2. Only rephrase and enhance existing content
3. CRITICAL: Naturally weave the JD keywords into bullet points
4. Start each bullet point with a strong action verb
5. Keep total word count to 500-600 words (one A4 page)

BASE RESUME (Markdown):
${baseResume.content}

JD KEYWORDS TO WEAVE THROUGHOUT:
${keywords}

TARGET JOB:
Company: ${jd.company_name}
Position: ${jd.job_title}

Generate a complete, professional resume in Markdown format. Return ONLY the resume content, no extra text.`,
        0.5
      )

      setGeneratedResume(generated)
      setActiveTab('resume')
    } catch (error) {
      console.error('Generation failed:', error)
      alert('Resume generation failed. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const generateCoverLetter = async () => {
    if (!jd?.parsed_keywords) {
      alert('Please analyze the JD first')
      return
    }

    const key = getApiKey()
    if (!key) {
      alert('Please set your OpenRouter API key')
      return
    }

    setIsGenerating(true)

    const storedResumes = localStorage.getItem('resumes')
    const resumes: Resume[] = storedResumes ? JSON.parse(storedResumes) : []
    const baseResume = resumes.find(r => r.is_base_resume) || resumes[0]

    if (!baseResume) {
      alert('Please create a base resume first')
      setIsGenerating(false)
      return
    }

    try {
      const generated = await callOpenRouter(
        `Write a professional cover letter for the following job application.

JOB DESCRIPTION:
${jd.raw_content}

APPLICANT BACKGROUND (from resume):
${baseResume.content}

REQUIREMENTS:
- Address the hiring manager professionally
- Highlight 2-3 most relevant experiences/skills
- Show enthusiasm for the company and role
- Keep it concise (250-400 words)
- Use a professional but personable tone

Company: ${jd.company_name}
Position: ${jd.job_title}

Return ONLY the cover letter text, no extra formatting or explanations.`,
        0.6
      )

      setGeneratedCoverLetter(generated)
      setActiveTab('cover')
    } catch (error) {
      console.error('Generation failed:', error)
      alert('Cover letter generation failed. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const saveGeneratedResume = () => {
    if (!generatedResume) return

    const newResume: Resume = {
      id: Date.now().toString(),
      title: `${jobTitle} at ${companyName}`,
      content: generatedResume,
      is_base_resume: false,
    }

    const stored = localStorage.getItem('resumes')
    const resumes: Resume[] = stored ? JSON.parse(stored) : []
    resumes.push(newResume)
    localStorage.setItem('resumes', JSON.stringify(resumes))

    alert('Resume saved to your collection!')
    navigate('/dashboard')
  }

  const handleExportPDF = async (type: 'resume' | 'cover') => {
    setIsExporting(true)
    try {
      const elementId = type === 'resume' ? 'generated-resume' : 'generated-cover'
      const element = document.getElementById(elementId)
      if (!element) return

      const filename = type === 'resume'
        ? `${jobTitle.replace(/\s+/g, '_')}_Resume.pdf`
        : `${jobTitle.replace(/\s+/g, '_')}_Cover_Letter.pdf`

      await exportToPDF(elementId, filename)
    } catch (error) {
      console.error('Export failed:', error)
      alert('PDF export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleSetApiKey = () => {
    const key = prompt('Enter your OpenRouter API key:')
    if (key) {
      localStorage.setItem('openrouter_api_key', key)
      setApiKey(key)
    }
  }

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
            <h1 className="text-lg font-semibold">JD Analyzer & Resume Generator</h1>
          </div>
          {!apiKey && (
            <Button variant="outline" size="sm" onClick={handleSetApiKey}>
              Set API Key
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - JD Input */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
                <CardDescription>Paste the job description to analyze</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Company</label>
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Company Name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Job Title</label>
                    <Input
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="Position Title"
                    />
                  </div>
                </div>
                <Textarea
                  value={jdContent}
                  onChange={(e) => setJdContent(e.target.value)}
                  placeholder="Paste job description here..."
                  className="h-64"
                />
                <Button 
                  onClick={analyzeJD} 
                  disabled={isAnalyzing || !jdContent.trim()}
                  className="w-full"
                >
                  {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isAnalyzing ? 'Analyzing...' : 'Analyze JD'}
                </Button>
              </CardContent>
            </Card>

            {/* Keywords Display */}
            {jd?.parsed_keywords && (
              <Card>
                <CardHeader>
                  <CardTitle>Extracted Keywords</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {jd.parsed_keywords.required_skills.map((skill, i) => (
                        <Badge key={i} variant="default">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Preferred Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {jd.parsed_keywords.preferred_skills.map((skill, i) => (
                        <Badge key={i} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Key Responsibilities</h4>
                    <div className="flex flex-wrap gap-1">
                      {jd.parsed_keywords.responsibility_keywords.map((resp, i) => (
                        <Badge key={i} variant="outline">{resp}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generate Buttons */}
            {jd?.parsed_keywords && (
              <div className="flex gap-4">
                <Button 
                  onClick={generateResume}
                  disabled={isGenerating}
                  className="flex-1"
                >
                  {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Resume
                </Button>
                <Button 
                  onClick={generateCoverLetter}
                  disabled={isGenerating}
                  variant="outline"
                  className="flex-1"
                >
                  Generate Cover Letter
                </Button>
              </div>
            )}
          </div>

          {/* Right Column - Output */}
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="jd">JD Preview</TabsTrigger>
                <TabsTrigger value="resume" disabled={!generatedResume}>Resume</TabsTrigger>
                <TabsTrigger value="cover" disabled={!generatedCoverLetter}>Cover Letter</TabsTrigger>
              </TabsList>

              <TabsContent value="jd">
                <Card>
                  <CardContent className="pt-6">
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                      {jdContent || 'Paste a job description to see preview'}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="resume">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Generated Resume</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(generatedResume)}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportPDF('resume')}
                        disabled={isExporting}
                      >
                        <FileDown className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                      <Button size="sm" onClick={saveGeneratedResume}>
                        Save
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div id="generated-resume" className="prose prose-sm max-w-none bg-white p-4">
                      <ReactMarkdown>{generatedResume}</ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cover">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Generated Cover Letter</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(generatedCoverLetter)}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportPDF('cover')}
                        disabled={isExporting}
                      >
                        <FileDown className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div id="generated-cover" className="prose prose-sm max-w-none whitespace-pre-wrap bg-white p-4">
                      {generatedCoverLetter}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
