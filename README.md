# Learning OS 2.0 — Smart LMS with AI Copilot & Learning Score

🎓 **MVP Learning OS** - Hệ điều hành học tập thông minh với AI Copilot, Learning Score, Quiz Scoring, Personalized Study Plans và Professional Metrics.

## ✨ Tính năng chính

### 📚 **Smart LMS Copilot**
- Upload PDF/TXT → Tự động sinh Summary, Quiz, Flashcards, Study Plan
- Chat trực tiếp với AI Tutor về nội dung tài liệu
- Mục tiêu học tập tự động được sinh dựa trên nội dung

### 📊 **Learning Score Calculation**
- **Formula**: `Learning Score = (Quiz Score × 40%) + (Completion Rate × 35%) + (Engagement Score × 25%)`
- Theo dõi Learning Score theo thời gian
- Mastery Levels: Beginner → Intermediate → Advanced → Expert

### ✅ **Quiz & Scoring System**
- Auto-generated Quiz từ nội dung tài liệu
- Tính điểm tự động với feedback
- Gợi ý tiếp theo dựa trên kết quả
- Lưu lịch sử quiz attempts

### 📅 **Personalized Study Plan**
- Sinh kế hoạch học tập theo 7 ngày tuần
- Ước tính thời gian hoàn thành (3-7 ngày)
- Daily Goals & Focus Areas cá nhân hóa
- Motivation Tips & Next Milestones

### 🏆 **Professional Metrics Dashboard**
- **Learning Score**: 0-100 điểm
- **Mastery Level**: Beginner/Intermediate/Advanced/Expert
- **Professional Badges**: Excellence Master, Persistent Learner, Knowledge Seeker, Expert Achiever
- **Skill Progress**: Communication, Technical Knowledge, Problem Solving, Time Management, Critical Thinking, Collaboration
- **Learning Streak**: Theo dõi ngày học liên tục
- **Recent Activities**: Lịch sử tương tác
- **Professional Achievements**: Huy hiệu & thành tích với Tier (Bronze, Silver, Gold, Platinum)

### 🎯 **Demo Results**
- Hiển thị mô phỏng của một Learner xuất sắc
- Learning Score: 88.5/100 (Advanced Level)
- 12 Quiz Attempts với Avg Score: 85.3%
- 4 Professional Badges
- Skill Progress bars cho tất cả domains

## 🏗️ Cấu trúc dự án

```
Learning OS/
├── backend/
│   ├── app/
│   │   └── main.py              # FastAPI + OpenAI Integration
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── App.tsx              # Tabbed Dashboard Interface
│       ├── App.css              # Responsive Dark Theme
│       ├── main.tsx
│       └── vite-env.d.ts
├── .gitignore
├── vercel.json
└── README.md
```

## 🚀 Cài đặt & Chạy

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
.venv/Scripts/activate  # Windows
# source .venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
copy .env.example .env
# Edit .env and add OPENAI_API_KEY=your_key_here
```

**Chạy Backend:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend sẽ chạy tại: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
- Swagger: `http://localhost:8000/swagger`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment (nếu cần)
# Vite tự động proxy API requests tới backend

# Run development server
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

## 📡 API Endpoints

### Document & Content Generation
- `POST /upload` - Upload PDF/TXT → Auto-generate Summary, Quiz, Flashcards, Study Plan
  - Response: `UploadResponse` với learning_objectives

### Learning Interaction
- `POST /chat` - Chat với AI Tutor về tài liệu
  - Request: `{document_id, question}`
  - Response: `{answer}`

### Quiz & Scoring
- `POST /submit_quiz` - Submit Quiz answers → Get Learning Score
  - Request: `{quiz_id, answers: [0-3]}` (indices of chosen options)
  - Response: `{score, total_questions, correct_answers, learning_score, feedback, next_recommendations}`

### Study Planning
- `GET /personalized_plan/{document_id}` - Get Personalized Study Plan
  - Response: `{weekly_schedule, daily_goals, focus_areas, estimated_completion_days, motivation_tip, next_milestone}`

### Metrics & Analytics
- `GET /metrics/{user_id}` - Get User Learning Metrics
  - Response: `{metrics, recent_activities, professional_achievements, skill_progress}`

### Demo
- `GET /demo_results` - Get Demo Results (Excellent Learner Profile)
  - Response: `{metrics: {...}, recent_activities: [...], professional_achievements: [...], skill_progress: {...}}`

- `GET /status` - API Status
  - Response: `{status, documents, active_users}`

## 🎨 Frontend UI/UX

### Tab Navigation (5 Tabs)
1. **📚 Smart Copilot** - Upload & Chat
2. **✅ Quiz & Scoring** - Quiz Submission + Learning Score Display
3. **📊 Metrics** - Learning Metrics Dashboard + Professional Badges
4. **📅 Study Plan** - Personalized Weekly/Daily Study Schedule
5. **🎯 Demo Results** - Demo Results Display

### Design Features
- Dark theme với gradients (Modern AI app style)
- Responsive Grid layouts
- Progress bars cho Learning Score & Skills
- Color-coded cards (Green, Blue, Orange, Purple)
- Emoji icons cho visual clarity
- Real-time UI updates

## 📊 Learning Score Calculation Logic

```python
def calculate_learning_score(
    quiz_score: float,        # 0-100 (Quiz performance)
    completion_rate: float,   # 0-100 (Content completion %)
    engagement_score: float   # 0-100 (Chat interactions, etc)
) -> float:
    return (quiz_score * 0.40) + (completion_rate * 0.35) + (engagement_score * 0.25)

# Mastery Levels:
# 85+: Expert
# 70-84: Advanced
# 50-69: Intermediate
# <50: Beginner

# Professional Badges:
# - Excellence Master: score >= 85
# - Persistent Learner: 5+ quiz attempts
# - Knowledge Seeker: score >= 60
# - Expert Achiever: 10+ quiz attempts
```

## 🔌 Technology Stack

- **Frontend**: React 18 + TypeScript + Vite + Axios
- **Backend**: FastAPI + Python 3.10+
- **AI/ML**: OpenAI API (GPT-4o-mini, text-embedding-3-small)
- **Vector DB**: ChromaDB (semantic search)
- **PDF Processing**: PyPDF2
- **Deployment**: Vercel (Frontend), Any (Backend)

## 🌐 Deployment

### Frontend (Vercel)

```bash
# Vercel already configured in vercel.json
# Just push to git or run:
npm run build
# Deploy to Vercel dashboard
```

### Backend (Any Cloud)

```bash
# Option 1: Heroku
heroku create your-app-name
git push heroku main

# Option 2: AWS/GCP/Azure - Deploy with Docker or manual setup
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 📝 Example Workflow

1. **Upload Document**
   ```
   User uploads "Python Fundamentals.pdf"
   ↓
   Backend extracts text → Chunks → Embeddings
   ↓
   OpenAI generates:
   - 📝 Summary (Key concepts)
   - ❓ Quiz (3 MCQ questions)
   - 🃏 Flashcards (5 cards)
   - 📖 Study Plan (1-day schedule)
   - 🎯 Learning Objectives (5 objectives)
   ```

2. **Chat with AI Tutor**
   ```
   User: "Giải thích về list comprehension"
   ↓
   Backend finds relevant chunks (semantic search)
   ↓
   OpenAI generates detailed explanation with examples
   ```

3. **Complete Quiz**
   ```
   User answers 3 quiz questions
   ↓
   Backend calculates:
   - Quiz Score: 66.7% (2/3 correct)
   - Learning Score: 67.8/100
   - Mastery: Intermediate
   ↓
   Display: Score, Feedback, Recommendations
   ```

4. **View Metrics**
   ```
   Dashboard shows:
   - Learning Score progression
   - Skill progress bars
   - Professional badges earned
   - Recent activities
   - Next milestone to achieve
   ```

5. **Study Plan**
   ```
   Personalized 7-day schedule with:
   - Daily goals aligned to learning objectives
   - Time estimates
   - Focus areas
   - Motivation tips
   ```

## 🛠️ Development Notes

### Adding New Features

1. **Backend**: Add endpoint in `main.py` + new Pydantic model
2. **Frontend**: Update `App.tsx` + add UI component
3. **Styling**: Update `App.css` with responsive design

### Customization

- Change Learning Score weights in `calculate_learning_score()`
- Modify Mastery Levels in `get_mastery_level()`
- Add/remove Professional Badges in `get_professional_badges()`
- Customize prompts in OpenAI calls

## 🔐 Environment Variables

```
# .env (Backend)
OPENAI_API_KEY=sk-...

# Optional:
# FASTAPI_ENV=production
# DATABASE_URL=postgresql://...
```

## 📚 Dependencies

### Backend
```
fastapi>=0.103.0
uvicorn[standard]>=0.23.0
python-multipart>=0.0.6
PyPDF2>=3.0.0
openai>=1.0.0
numpy>=1.26.0
python-dotenv>=1.0.0
chromadb>=0.4.0
```

### Frontend
```
react@^18.x
typescript@^5.x
vite@^5.x
axios@^1.x
```

## 🤝 Contributing

Cải thiện dự án bằng cách:
1. Thêm feature mới
2. Optimize performance
3. Cải thiện UI/UX
4. Viết test cases
5. Cập nhật documentation

## 📄 License

MIT

## 🎯 Roadmap

- [ ] User authentication & profiles
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Collaborative learning (groups)
- [ ] Advanced analytics (Heatmaps, Learning patterns)
- [ ] Gamification (Leaderboards, Achievements)
- [ ] Integration with learning platforms (Coursera, Udemy)
- [ ] Custom AI model fine-tuning
- [ ] Offline support (PWA)

---

**Created with ❤️ for lifelong learners**

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy mặc định tại `http://127.0.0.1:5173` và gọi API tới `http://127.0.0.1:8000/api`.

## Endpoints

- `POST /api/upload` — upload PDF/TXT, tạo summary/quiz/flashcards/study plan
- `POST /api/chat` — chat với tài liệu đã upload
- `GET /api/status` — kiểm tra trạng thái backend

## Vercel / Deploy

Dự án đã cấu hình deploy cho cả backend và frontend.

> Lưu ý: backend sẽ lưu chỉ mục RAG trong `backend/chroma_db`, thư mục này đã được loại trừ khỏi git.

### Deploy Vercel (full-stack)

1. Cài Vercel CLI nếu chưa có:

```bash
npm install -g vercel
```

2. Từ thư mục gốc repo:

```bash
vercel login
vercel
```

3. Chọn project mới hoặc liên kết repo hiện tại.
4. Chọn `frontend` làm thư mục tĩnh cho build và để Vercel xử lý backend theo `vercel.json`.

Sau khi deploy, Vercel sẽ tạo URL dạng `https://your-project.vercel.app`.

### GitHub Pages (frontend tĩnh)

Đây là chỉ deploy phần frontend tĩnh nếu bạn không cần backend.

1. Chuyển tới thư mục frontend:

```bash
cd frontend
npm install
```

2. Cập nhật `homepage` trong `frontend/package.json` với URL GitHub Pages của bạn, ví dụ:

```json
"homepage": "https://username.github.io/learning-os"
```

3. Build và deploy:

```bash
npm run deploy
```

4. Mở `https://username.github.io/learning-os` để xem giao diện demo.

> Lưu ý: GitHub Pages chỉ phù hợp với frontend tĩnh. Nếu cần endpoint AI, dùng Vercel hoặc một backend hosting khác.

## Ghi chú

File demo tĩnh cũ (`index.html`, `style.css`, `script.js`) vẫn còn trong repository. Dự án mới sử dụng `frontend/` và `backend/` để triển khai MVP full-stack.
