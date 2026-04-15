# Resume Tailor

AI-Powered Resume & Cover Letter Generator

An intelligent tool that helps you tailor your resume for specific job descriptions using AI. No login required - all data is stored locally in your browser.

## Features

- ✨ **AI-Powered Resume Tailoring** - Automatically customize your resume based on job descriptions
- 🤖 **JD Analysis** - Extract key skills and requirements from job postings
- 📝 **Cover Letter Generation** - Generate personalized cover letters
- 💾 **Local Storage** - All your data stays in your browser (no cloud, no login)
- 📄 **PDF Export** - Export tailored resumes and cover letters as PDF
- 🎨 **Markdown Editor** - Edit resumes with familiar Markdown syntax
- 🔄 **Resume Management** - Create, edit, duplicate, and delete multiple resumes

## Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd resume-tailor

# Start the application
docker-compose up -d

# Access the application
# Frontend: http://localhost:5173
# API Docs: http://localhost:8000/docs
```

### Manual Setup

#### Backend
```bash
cd backend
pip install -e ".[dev]"
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Usage Guide

### 1. Create Your Base Resume

1. Open http://localhost:5173
2. You'll see a default resume template
3. Click on the resume card to edit
4. Replace the template with your actual information
5. Check "This is my base resume" if this is your main resume

### 2. Analyze a Job Description

1. Click **"JD Analyzer"** button in the top right
2. Fill in:
   - **Company**: Company name
   - **Job Title**: Position title
   - **Job Description**: Paste the full JD text
3. Click **"Analyze JD"**
4. Review extracted keywords:
   - Required Skills (blue badges)
   - Preferred Skills (gray badges)
   - Key Responsibilities (outlined badges)

> **Note**: First time use requires an OpenRouter API key. Click "Set API Key" and enter your key (get one free at [openrouter.ai](https://openrouter.ai))

### 3. Generate Tailored Resume

1. After JD analysis, click **"Generate Resume"**
2. AI will create a customized version of your base resume
3. The generated resume will:
   - Naturally weave in JD keywords
   - Use strong action verbs
   - Match the job requirements
4. Review the generated content in the preview tab

### 4. Generate Cover Letter

1. Click **"Generate Cover Letter"**
2. AI creates a personalized cover letter based on:
   - The job description
   - Your background from the base resume
3. Covers your relevant experience and enthusiasm for the role

### 5. Export Your Documents

#### From JD Analyzer:
- Click **PDF** button to export generated resume/cover letter
- Click **Copy** button to copy content to clipboard
- Click **Save** to add generated resume to your collection

#### From Resume Editor:
- Click **PDF** to export as PDF
- Click **MD** to export as Markdown
- Click **TXT** to export as plain text

### 6. Manage Your Resumes

On the Dashboard:
- **New Resume**: Create a new resume from scratch
- **Duplicate**: Copy an existing resume
- **Delete**: Remove a resume
- **Edit**: Modify resume content

## Data Storage

All data is stored in your browser's **localStorage**:
- Resumes (including base resume and tailored versions)
- Job descriptions and analysis results
- OpenRouter API key

**To backup your data**: Use browser's developer tools to export localStorage.

**To clear all data**: Clear browser cookies and site data for localhost:5173.

## Getting OpenRouter API Key

1. Visit [openrouter.ai](https://openrouter.ai)
2. Create a free account
3. Go to Settings → API Keys
4. Create a new key
5. Copy and paste it into the app when prompted

> The free tier includes access to models like `nvidia/nemotron-3-super-120b-a12b:free` with rate limits.

## Project Structure

```
resume-tailor/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── api/         # API routes
│   │   ├── core/        # Security & encryption
│   │   ├── db/          # Database models
│   │   ├── models/      # SQLAlchemy models
│   │   └── schemas/     # Pydantic schemas
│   ├── Dockerfile
│   └── pyproject.toml
├── frontend/            # React + TypeScript frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   └── utils/       # Utilities
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── SPEC.md              # Detailed specification
└── README.md           # This file
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Python 3.11, FastAPI, SQLAlchemy, PostgreSQL
- **AI**: OpenRouter API (supports multiple LLM providers)
- **PDF**: html2canvas + jsPDF
- **Deployment**: Docker, Docker Compose

## Development

### Running Tests
```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

### Code Formatting
```bash
# Backend
cd backend
black app/
ruff check app/

# Frontend
cd frontend
npm run lint
npm run format
```

## License

MIT License - feel free to use for personal or commercial projects.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/) components
- Powered by [OpenRouter](https://openrouter.ai/) for AI capabilities
