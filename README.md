# Legal Document Comparison Tool

A comprehensive web application for comparing legal and policy documents with AI-powered explanations of changes.

## Features

- **Document Upload**: Support for PDF, DOCX, and plain text files
- **Intelligent Comparison**: Advanced diff algorithm highlighting additions, deletions, and modifications
- **AI Explanations**: Plain-language explanations for each detected change
- **Side-by-Side Viewer**: Professional document comparison interface
- **Impact Assessment**: Automatic categorization of change importance
- **Export Results**: Download comparison results for record-keeping

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **File Processing**: PDF-parse, Mammoth (DOCX), Multer
- **Diff Engine**: diff-match-patch
- **AI Integration**: Placeholder system (ready for OpenAI/Vertex AI)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

### Running the Application

1. Start both frontend and backend:
```bash
npm start
```

This will start:
- Backend server on http://localhost:3001
- Frontend development server on http://localhost:5173

Alternatively, you can run them separately:

```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend  
npm run dev
```

### Usage

1. Upload your original document (PDF, DOCX, or TXT)
2. Upload the updated version of the same document
3. Click "Compare Documents" to analyze differences
4. Review the side-by-side comparison with highlighted changes
5. Examine AI-generated explanations in the summary panel
6. Export results for documentation

## File Support

- **PDF**: Full text extraction with formatting preservation
- **DOCX**: Microsoft Word document support
- **TXT**: Plain text files
- **Size Limit**: 10MB per file

## API Endpoints

- `POST /api/documents/compare` - Compare two documents
- `GET /api/health` - Server health check

## Project Structure

```
├── server/
│   ├── index.js              # Express server
│   ├── routes/
│   │   └── documents.js      # Document comparison routes
│   └── utils/
│       ├── textExtraction.js # PDF/DOCX text extraction
│       ├── diffProcessor.js  # Document diff processing
│       └── aiProcessor.js    # AI explanation generation
├── src/
│   ├── components/
│   │   ├── DocumentUpload.tsx    # File upload interface
│   │   ├── DocumentViewer.tsx    # Side-by-side document viewer
│   │   ├── ChangesSummary.tsx    # Changes summary panel
│   │   └── DiffRenderer.tsx      # Diff highlighting component
│   ├── utils/
│   │   └── documentApi.ts        # API client utilities
│   ├── types.ts                  # TypeScript definitions
│   └── App.tsx                   # Main application
└── uploads/                      # Document storage directory
```

## AI Integration

The application includes a placeholder AI system that can be easily connected to:

- OpenAI GPT API
- Google Vertex AI
- Azure Cognitive Services
- Other language models

To integrate real AI, modify `/server/utils/aiProcessor.js` with your preferred AI service.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.