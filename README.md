# Learning OS — Full Stack Demo

Dự án này là MVP **Learning OS** full-stack với:

- **Frontend:** React + Vite
- **Backend:** FastAPI
- **AI:** OpenAI API
- **MVP:** Upload PDF/TXT, tạo summary, quiz, flashcards, study plan và chat với tài liệu

## Cấu trúc dự án

```
Learning OS/
├── backend/
│   ├── app/
│   │   └── main.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── App.tsx
│       ├── App.css
│       ├── main.tsx
│       └── vite-env.d.ts
├── .gitignore
└── vercel.json
```

## Cài đặt nhanh

### Backend

```bash
cd backend
python -m venv .venv
.venv/Scripts/activate
pip install -r requirements.txt
copy .env.example .env
```

Mở `backend/.env` và thêm `OPENAI_API_KEY=your_openai_api_key_here`.

Chạy backend:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

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
