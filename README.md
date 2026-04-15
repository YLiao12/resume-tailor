# Resume Tailor

AI-Powered Resume & Cover Letter Generator - Pure Frontend Version

A fully client-side tool that helps you tailor your resume for specific job descriptions using AI. All data is stored locally in your browser - no server, no login, no data leaves your device.

## Features

- ✨ **AI-Powered Resume Tailoring** - Automatically customize your resume based on job descriptions
- 🤖 **JD Analysis** - Extract key skills and requirements from job postings using AI
- 📝 **Cover Letter Generation** - Generate personalized cover letters
- 💾 **100% Local Storage** - All data stays in your browser (localStorage)
- 📄 **PDF Export** - Export tailored resumes and cover letters as PDF
- 🎨 **Markdown Editor** - Edit resumes with familiar Markdown syntax
- 🔄 **Resume Management** - Create, edit, duplicate, and delete multiple resumes
- 🔑 **API Key Management** - Your OpenRouter API key is stored locally

## Quick Start

### Option 1: Direct Open (No Build Required)
Simply open `index.html` in your browser after building once, or use the live version.

### Option 2: Development Server

```bash
cd frontend
npm install
npm run dev
```

Access at http://localhost:5173

### Option 3: Build for Production

```bash
cd frontend
npm install
npm run build
```

Then serve the `dist` folder with any static file server.

## Usage Guide

### 1. Set Your API Key

On first use, click **"Set API Key"** and enter your OpenRouter API key:
1. Visit [openrouter.ai](https://openrouter.ai)
2. Create a free account
3. Go to Settings → API Keys
4. Create a new key and copy it
5. Paste into the app

Your API key is stored only in your browser's localStorage.

### 2. Create Your Base Resume

1. Open the app (you'll see a default resume template)
2. Click on the resume card to edit
3. Replace the template with your actual information
4. Check "This is my base resume" if this is your main resume
5. All changes are auto-saved to localStorage

### 3. Analyze a Job Description

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

### 4. Generate Tailored Resume

1. After JD analysis, click **"Generate Resume"**
2. AI will create a customized version of your base resume
3. The generated resume will:
   - Naturally weave in JD keywords
   - Use strong action verbs
   - Match the job requirements
4. Review in the preview tab

### 5. Generate Cover Letter

1. Click **"Generate Cover Letter"**
2. AI creates a personalized cover letter
3. Covers your relevant experience and enthusiasm for the role

### 6. Export Your Documents

- **PDF**: Click PDF button to export as PDF
- **Copy**: Click Copy button to copy content
- **Save**: Save generated resume to your local collection

## Data Storage

All data is stored in your browser's **localStorage**:
- `resumes` - Your resume collection
- `jds` - Job descriptions and analysis results
- `openrouter_api_key` - Your API key

### Backup Your Data

To backup, open browser DevTools (F12) → Application → Local Storage → Copy the values.

### Clear All Data

To reset everything, clear browser cookies and site data for this domain.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **UI Components**: shadcn/ui (custom implementation)
- **AI**: OpenRouter API (client-side calls)
- **PDF**: html2canvas + jsPDF
- **Storage**: Browser localStorage

## Architecture

```
resume-tailor/
├── frontend/
│   ├── src/
│   │   ├── components/ui/     # UI components
│   │   ├── pages/             # Page components
│   │   │   ├── Dashboard.tsx      # Resume list
│   │   │   ├── ResumeNew.tsx      # Create resume
│   │   │   ├── ResumeEdit.tsx     # Edit + export
│   │   │   └── JDAnalyzer.tsx     # JD analysis + AI generation
│   │   ├── utils/
│   │   │   ├── cn.ts         # Tailwind utilities
│   │   │   └── export.ts     # PDF export functions
│   │   ├── App.tsx           # Routes
│   │   └── main.tsx          # Entry
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Privacy & Security

- **No Server**: This is a pure frontend application
- **No Tracking**: No analytics, no cookies
- **Local Only**: All data stays in your browser
- **Direct API Calls**: AI requests go directly from your browser to OpenRouter
- **You Control Your Data**: Clear localStorage anytime to delete everything

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint

# Format
npm run format
```

## License

MIT License - feel free to use for personal or commercial projects.

## Acknowledgments

- UI components based on [shadcn/ui](https://ui.shadcn.com/)
- AI powered by [OpenRouter](https://openrouter.ai/)
