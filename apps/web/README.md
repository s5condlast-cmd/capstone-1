# Practicum System - STI Marikina

A comprehensive student internship management system for STI Marikina, designed to streamline the practicum workflow for students, advisors, and administrators.

## Features

### 🔐 Authentication System
- **Student ID + Password** login
- Role-based access control (Admin, Advisor, Student)
- Session management with localStorage

### 📚 Default Accounts
| Student ID | Password | Role |
|------------|----------|------|
| admin | admin123 | Admin |
| advisor1 | advisor123 | Advisor |
| student1 | student123 | Student |

---

## For Students

### 📋 Dashboard
- Overview statistics (Approved/Rejected/Pending submissions)
- Recent journal entries
- Announcements from advisors
- Notifications for submission status changes

### 📄 Requirements (Documents)
- View required documents list
- Upload requirements (Endorsement Letter, Resume, Waiver Form, Medical Certificate, NDA)
- Mark submissions as Urgent (alerts advisor)
- Track submission status (Pending/Approved/Rejected/Revision)

### 📝 Journal
- **Voice Input**: Record voice and transcribe using Groq Whisper AI
- **AI Summary**: Get AI-generated bullet points from transcription
- **Generate Full Journal**: Create detailed journal entry using Llama AI
- **Preview**: View formatted journal before submission
- **Save Draft**: Save incomplete entries
- **Submit**: Send journal to advisor for review

### 📅 DTR (Daily Time Record)
- Upload DTR file (PDF/DOCX/JPG/PNG)
- Mark as Urgent option
- Submit for advisor review

### 📜 MOA (Memorandum of Agreement)
- Upload MOA file
- View adviser revisions/feedback
- Mark as Urgent option
- Submit for advisor review

### 📄 Browse Templates
- Modal popup with available templates:
  - Endorsement Letter
  - Request Letter
  - Waiver Form
  - Certificate Request
  - Excuse Letter
  - Evaluation Form
- Mark as Urgent before requesting

---

## For Advisors

### 📥 Submissions Dashboard
- View submissions from assigned students only
- Filter by status: All, Pending, Approved, Rejected
- Statistics: Pending, Approved, Revision counts

### 🔍 Review Process
- View submission details (student name, type, date, content)
- See urgent flags
- Add feedback/notes
- **Actions**:
  - ✅ Approve
  - ⚠️ Request Revision (sends back to student)
  - ❌ Reject

---

## For Administrators

### 👥 User Management
- View all users (Admin, Advisors, Students)
- Create new users (Student ID, Name, Email, Password, Role)
- Delete users

### 🎓 Adviser Assignment
- Assign adviser to each student via dropdown
- Assignments saved to localStorage

### 📄 Template Management
- View all document templates
- Add new templates (Name, Description, Category)
- Delete templates

### 📊 System Monitoring
- Total Students count
- Total Advisors count
- Pending Submissions count
- All Submissions list with status

---

## Technical Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Design System**: Azure Scholar (#00529B primary, #F8FAFC background)
- **AI Integration**: Groq API (Whisper for transcription, Llama for generation)
- **Storage**: localStorage (for demo purposes)

## API Endpoints

- `POST /api/voice` - Voice transcription and AI generation
  - Modes: `transcribe` (Whisper), `generate` (Llama)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
apps/web/src/
├── app/
│   ├── login/          # Login page
│   ├── dashboard/     # Student dashboard
│   ├── documents/     # Requirements page
│   ├── journal/       # Journal with AI features
│   ├── dtr/           # Daily Time Record
│   ├── moa/           # Memorandum of Agreement
│   ├── admin/         # Admin dashboard
│   ├── advisor/       # Advisor dashboard
│   └── api/           # API routes
└── lib/
    ├── auth.ts        # Authentication utilities
    └── ai/            # AI integration (Groq)
```

## Features Implemented

✅ Document Submission & Review Flow  
✅ AI Report Generation (Voice → Transcription → Summary → Journal)  
✅ Template/Letter Request Flow  
✅ Notification System (status changes)  
✅ Admin Control (User Management, Template Upload, Monitoring)  
✅ Adviser Assignment to Students  
✅ Role-based Access Control  

## Design System

- **Primary Color**: #00529B (Azure Blue)
- **Secondary Color**: #0073C7
- **Background**: #F8FAFC
- **Card Background**: #FFFFFF
- **Text Primary**: #1E293B
- **Text Secondary**: #64748B
- **Success**: #16A34A
- **Warning**: #F59E0B
- **Error**: #DC2626
- **Urgent**: #DC2626

---

## License

This project is for educational purposes for STI Marikina.