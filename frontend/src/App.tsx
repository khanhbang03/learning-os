import { useState } from 'react';
import axios from 'axios';

interface UploadResult {
  document_id: string;
  summary: string;
  quiz: string[];
  flashcards: string[];
  study_plan: string;
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [question, setQuestion] = useState('');
  const [chatAnswer, setChatAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null);
    setUploadResult(null);
    setChatAnswer('');
    setError('');
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError('Vui lòng chọn file PDF hoặc TXT.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
    setError('');
    setChatAnswer('');

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadResult(response.data);
      setDocumentName(file.name);
    } catch (err) {
      setError('Không tải được tài liệu. Vui lòng kiểm tra backend và OPENAI_API_KEY.');
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    if (!uploadResult) {
      setError('Bạn cần upload tài liệu trước.');
      return;
    }
    if (!question.trim()) {
      setError('Nhập câu hỏi của bạn.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/chat', {
        document_id: uploadResult.document_id,
        question,
      });
      setChatAnswer(response.data.answer);
    } catch (err) {
      setError('Không thể trả lời câu hỏi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="hero-card">
        <div>
          <p className="eyebrow">Learning OS 2.0</p>
          <h1>Hệ Điều Hành Học Tập AI</h1>
          <p>
            Upload tài liệu học, nhận summary, quiz, flashcards và chat trực tiếp với nội dung.
          </p>
        </div>
      </header>

      <main className="content-grid">
        <section className="panel upload-panel">
          <h2>Smart LMS Copilot</h2>
          <form onSubmit={handleUpload} className="upload-form">
            <input type="file" accept=".pdf,.txt" onChange={handleFileChange} />
            <button type="submit" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Upload tài liệu'}
            </button>
          </form>
          {error && <div className="toast error">{error}</div>}
          {uploadResult && (
            <div className="result-card">
              <p className="document-label">Tài liệu: <strong>{documentName}</strong></p>
              <h3>Summary</h3>
              <p>{uploadResult.summary}</p>
              <div className="cards-row">
                <div className="small-card">
                  <h4>Quiz</h4>
                  <ol>
                    {uploadResult.quiz.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ol>
                </div>
                <div className="small-card">
                  <h4>Flashcards</h4>
                  <ul>
                    {uploadResult.flashcards.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="study-plan">
                <h4>Study Plan</h4>
                <p>{uploadResult.study_plan}</p>
              </div>
            </div>
          )}
        </section>

        <section className="panel chat-panel">
          <h2>Chat with document</h2>
          <p>Hãy hỏi AI về nội dung vừa upload để nhận giải thích và gợi ý nhanh.</p>
          <textarea
            rows={5}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={uploadResult ? `Hỏi về ${documentName}` : 'Upload tài liệu để bắt đầu chat'}
            disabled={!uploadResult}
          />
          <button onClick={handleChat} disabled={loading || !uploadResult || !question.trim()}>
            {loading ? 'Đang trả lời...' : 'Hỏi AI Tutor'}
          </button>
          {chatAnswer && (
            <div className="chat-answer">
              <h4>AI Tutor trả lời</h4>
              <p>{chatAnswer}</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
