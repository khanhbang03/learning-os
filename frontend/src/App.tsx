import { useState, useEffect } from 'react';
import axios from 'axios';

interface UploadResult {
  document_id: string;
  summary: string;
  quiz: string[];
  flashcards: string[];
  study_plan: string;
  learning_objectives?: string[];
}

interface QuizResult {
  quiz_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  learning_score: number;
  feedback: string;
  next_recommendations: string[];
}

interface MetricsData {
  metrics: {
    user_id: string;
    learning_score: number;
    mastery_level: string;
    total_documents: number;
    total_quiz_attempts: number;
    average_quiz_score: number;
    learning_streak: number;
    documents_completed: number;
    professional_badges: string[];
    learning_path_progress: number;
  };
  recent_activities: any[];
  professional_achievements: any[];
  skill_progress: Record<string, number>;
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [question, setQuestion] = useState('');
  const [chatAnswer, setChatAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'copilot' | 'quiz' | 'metrics' | 'plan' | 'demo'>('copilot');
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
  const [studyPlan, setStudyPlan] = useState<any | null>(null);
  const [demoMetrics, setDemoMetrics] = useState<MetricsData | null>(null);
  const [documentId, setDocumentId] = useState<string>('');

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
      setDocumentId(response.data.document_id);
      setDocumentName(file.name);
      setQuizAnswers(new Array(response.data.quiz.length).fill(-1));
      
      // Fetch metrics
      fetchMetrics('default_user');
      
      // Fetch study plan
      fetchStudyPlan(response.data.document_id);
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

  const handleQuizSubmit = async () => {
    if (quizAnswers.includes(-1)) {
      setError('Vui lòng chọn đáp án cho tất cả câu hỏi.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/submit_quiz', {
        quiz_id: `quiz_${documentId}`,
        answers: quizAnswers,
      });
      setQuizResult(response.data);
      
      // Update metrics after quiz
      fetchMetrics('default_user');
    } catch (err) {
      setError('Lỗi khi submit quiz.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async (userId: string) => {
    try {
      const response = await axios.get(`/api/metrics/${userId}`);
      setMetricsData(response.data);
    } catch (err) {
      console.error('Error fetching metrics:', err);
    }
  };

  const fetchStudyPlan = async (docId: string) => {
    try {
      const response = await axios.get(`/api/personalized_plan/${docId}`);
      setStudyPlan(response.data);
    } catch (err) {
      console.error('Error fetching study plan:', err);
    }
  };

  const fetchDemoResults = async () => {
    try {
      const response = await axios.get('/api/demo_results');
      setDemoMetrics(response.data);
    } catch (err) {
      console.error('Error fetching demo results:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'demo') {
      fetchDemoResults();
    }
  }, [activeTab]);

  const renderProgressBar = (value: number, max: number = 100) => {
    const percentage = Math.min((value / max) * 100, 100);
    return (
      <div style={{ width: '100%', height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: '#4CAF50' }} />
      </div>
    );
  };

  const renderSkillBars = (skills: Record<string, number>) => {
    return (
      <div className="skills-grid">
        {Object.entries(skills).map(([skill, value]) => (
          <div key={skill} className="skill-item">
            <div className="skill-header">
              <span className="skill-name">{skill}</span>
              <span className="skill-value">{value.toFixed(1)}%</span>
            </div>
            {renderProgressBar(value)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="app-shell">
      <header className="hero-card">
        <div>
          <p className="eyebrow">🚀 Learning OS 2.0 - Smart LMS with AI Copilot</p>
          <h1>Hệ Điều Hành Học Tập AI Thông Minh</h1>
          <p>Upload tài liệu học → Nhận Summary → Làm Quiz → Theo dõi Learning Score → Nhận Personalized Study Plan</p>
        </div>
      </header>

      <div style={{ padding: '20px', borderBottom: '1px solid #e0e0e0' }}>
        <div className="tab-navigation" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {(['copilot', 'quiz', 'metrics', 'plan', 'demo'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: activeTab === tab ? '#4CAF50' : '#f0f0f0',
                color: activeTab === tab ? 'white' : 'black',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
              }}
            >
              {tab === 'copilot' && '📚 Smart Copilot'}
              {tab === 'quiz' && '✅ Quiz & Scoring'}
              {tab === 'metrics' && '📊 Metrics'}
              {tab === 'plan' && '📅 Study Plan'}
              {tab === 'demo' && '🎯 Demo Results'}
            </button>
          ))}
        </div>
      </div>

      <main className="content-grid" style={{ padding: '20px' }}>
        {/* SMART COPILOT TAB */}
        {activeTab === 'copilot' && (
          <section className="panel upload-panel">
            <h2>🤖 Smart LMS Copilot - Upload & Learn</h2>
            <form onSubmit={handleUpload} className="upload-form">
              <input type="file" accept=".pdf,.txt" onChange={handleFileChange} />
              <button type="submit" disabled={loading}>
                {loading ? 'Đang xử lý...' : '📤 Upload tài liệu'}
              </button>
            </form>
            {error && <div className="toast error">{error}</div>}
            {uploadResult && (
              <div className="result-card">
                <p className="document-label">📄 Tài liệu: <strong>{documentName}</strong></p>
                
                {uploadResult.learning_objectives && uploadResult.learning_objectives.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4>🎯 Mục tiêu học tập</h4>
                    <ul>
                      {uploadResult.learning_objectives.map((obj, idx) => (
                        <li key={idx}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <h3>📝 Summary</h3>
                <p>{uploadResult.summary}</p>
                
                <div className="cards-row">
                  <div className="small-card">
                    <h4>❓ Quiz</h4>
                    <ol>
                      {uploadResult.quiz.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ol>
                  </div>
                  <div className="small-card">
                    <h4>🃏 Flashcards</h4>
                    <ul>
                      {uploadResult.flashcards.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="study-plan">
                  <h4>📖 Study Plan</h4>
                  <p>{uploadResult.study_plan}</p>
                </div>
              </div>
            )}

            <section className="panel chat-panel" style={{ marginTop: '20px' }}>
              <h3>💬 Chat with AI Tutor</h3>
              <p>Hỏi AI về nội dung vừa upload để nhận giải thích và gợi ý nhanh.</p>
              <textarea
                rows={5}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder={uploadResult ? `Hỏi về ${documentName}` : 'Upload tài liệu để bắt đầu chat'}
                disabled={!uploadResult}
              />
              <button onClick={handleChat} disabled={loading || !uploadResult || !question.trim()}>
                {loading ? 'Đang trả lời...' : '🤖 Hỏi AI Tutor'}
              </button>
              {chatAnswer && (
                <div className="chat-answer">
                  <h4>✨ AI Tutor trả lời</h4>
                  <p>{chatAnswer}</p>
                </div>
              )}
            </section>
          </section>
        )}

        {/* QUIZ TAB */}
        {activeTab === 'quiz' && uploadResult && (
          <section className="panel">
            <h2>✅ Quiz & Learning Score</h2>
            {!quizResult ? (
              <div>
                <p>Trả lời câu hỏi sau để nhận Learning Score của bạn:</p>
                <div style={{ marginBottom: '20px' }}>
                  {uploadResult.quiz.map((question, idx) => (
                    <div key={idx} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                      <h4>Câu {idx + 1}: {question}</h4>
                      <div style={{ marginTop: '10px' }}>
                        {['A', 'B', 'C', 'D'].map((option, optIdx) => (
                          <label key={optIdx} style={{ display: 'block', marginBottom: '10px', cursor: 'pointer' }}>
                            <input
                              type="radio"
                              name={`question_${idx}`}
                              value={optIdx}
                              checked={quizAnswers[idx] === optIdx}
                              onChange={() => {
                                const newAnswers = [...quizAnswers];
                                newAnswers[idx] = optIdx;
                                setQuizAnswers(newAnswers);
                              }}
                            />
                            {' '} {option}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={handleQuizSubmit} disabled={loading}>
                  {loading ? 'Đang chấm...' : '📊 Nộp bài & Xem kết quả'}
                </button>
              </div>
            ) : (
              <div>
                <div style={{ 
                  padding: '20px', 
                  backgroundColor: quizResult.score >= 80 ? '#d4edda' : quizResult.score >= 60 ? '#fff3cd' : '#f8d7da',
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  <h3>🎯 Kết quả Quiz</h3>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
                    Điểm: {quizResult.score.toFixed(1)}/100
                  </div>
                  <div style={{ fontSize: '18px', marginBottom: '10px' }}>
                    Trả lời đúng: {quizResult.correct_answers}/{quizResult.total_questions}
                  </div>
                  <div style={{ fontSize: '16px', marginBottom: '10px' }}>
                    📈 Learning Score: <strong style={{ fontSize: '20px', color: '#4CAF50' }}>{quizResult.learning_score.toFixed(2)}</strong>
                  </div>
                  <p>{quizResult.feedback}</p>
                </div>
                
                <div style={{ padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px', marginBottom: '20px' }}>
                  <h4>💡 Gợi ý tiếp theo:</h4>
                  <ul>
                    {quizResult.next_recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
                
                <button onClick={() => setQuizResult(null)}>
                  📝 Làm lại Quiz
                </button>
              </div>
            )}
          </section>
        )}

        {/* METRICS TAB */}
        {activeTab === 'metrics' && metricsData && (
          <section className="panel">
            <h2>📊 Learning Metrics & Professional Achievements</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={{ padding: '20px', backgroundColor: '#e8f5e9', borderRadius: '8px' }}>
                <h4>🎯 Learning Score</h4>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#4CAF50' }}>
                  {metricsData.metrics.learning_score.toFixed(1)}/100
                </div>
                <p>Mastery: <strong>{metricsData.metrics.mastery_level}</strong></p>
                {renderProgressBar(metricsData.metrics.learning_score)}
              </div>

              <div style={{ padding: '20px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
                <h4>📚 Documents</h4>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2196F3' }}>
                  {metricsData.metrics.total_documents}
                </div>
                <p>Completed: {metricsData.metrics.documents_completed}</p>
              </div>

              <div style={{ padding: '20px', backgroundColor: '#fff3e0', borderRadius: '8px' }}>
                <h4>✅ Quiz Attempts</h4>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#FF9800' }}>
                  {metricsData.metrics.total_quiz_attempts}
                </div>
                <p>Avg Score: {metricsData.metrics.average_quiz_score.toFixed(1)}%</p>
              </div>

              <div style={{ padding: '20px', backgroundColor: '#f3e5f5', borderRadius: '8px' }}>
                <h4>🔥 Learning Streak</h4>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#9C27B0' }}>
                  {metricsData.metrics.learning_streak} days
                </div>
                <p>Keep it up! 💪</p>
              </div>
            </div>

            {metricsData.metrics.professional_badges.length > 0 && (
              <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <h3>🏆 Professional Badges</h3>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  {metricsData.metrics.professional_badges.map((badge, idx) => (
                    <div key={idx} style={{
                      padding: '15px 20px',
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      border: '2px solid #FFD700',
                      fontWeight: 'bold'
                    }}>
                      {badge}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h3 style={{ marginTop: '30px' }}>🎯 Skill Progress</h3>
            {renderSkillBars(metricsData.skill_progress)}

            {metricsData.recent_activities.length > 0 && (
              <div style={{ marginTop: '30px' }}>
                <h3>📅 Recent Activities</h3>
                {metricsData.recent_activities.map((activity, idx) => (
                  <div key={idx} style={{
                    padding: '10px',
                    borderBottom: '1px solid #e0e0e0',
                    marginBottom: '10px'
                  }}>
                    <strong>{activity.type}</strong> - {new Date(activity.timestamp).toLocaleString('vi-VN')}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* STUDY PLAN TAB */}
        {activeTab === 'plan' && studyPlan && (
          <section className="panel">
            <h2>📅 Personalized Study Plan</h2>
            
            <div style={{ padding: '20px', backgroundColor: '#e8f5e9', borderRadius: '8px', marginBottom: '20px' }}>
              <h3>⏱️ Estimated Completion: {studyPlan.estimated_completion_days} days</h3>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#4CAF50' }}>{studyPlan.motivation_tip}</p>
              <p style={{ fontSize: '16px', marginTop: '10px' }}>Next Milestone: <strong>{studyPlan.next_milestone}</strong></p>
            </div>

            <h3 style={{ marginTop: '20px' }}>📚 Focus Areas</h3>
            <div style={{ marginBottom: '20px' }}>
              {studyPlan.focus_areas.map((area: string, idx: number) => (
                <div key={idx} style={{
                  padding: '10px 15px',
                  backgroundColor: '#f0f0f0',
                  borderLeft: '4px solid #4CAF50',
                  marginBottom: '10px'
                }}>
                  {area}
                </div>
              ))}
            </div>

            <h3>🎯 Daily Goals</h3>
            <ul style={{ marginBottom: '20px' }}>
              {studyPlan.daily_goals.map((goal: string, idx: number) => (
                <li key={idx}>{goal}</li>
              ))}
            </ul>

            <h3>📖 Weekly Schedule</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              {studyPlan.weekly_schedule.map((dayPlan: any, idx: number) => (
                <div key={idx} style={{
                  padding: '15px',
                  backgroundColor: '#e3f2fd',
                  borderRadius: '8px'
                }}>
                  <h4>{dayPlan.day}</h4>
                  <p><strong>Topic:</strong> {dayPlan.topic}</p>
                  <p><strong>Duration:</strong> {dayPlan.duration}</p>
                  <p><strong>Activities:</strong></p>
                  <ul>
                    {dayPlan.activities?.map((activity: string, aidx: number) => (
                      <li key={aidx}>{activity}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* DEMO RESULTS TAB */}
        {activeTab === 'demo' && demoMetrics && (
          <section className="panel">
            <h2>🎯 Demo Results - Excellent Learner Profile</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={{ padding: '20px', backgroundColor: '#e8f5e9', borderRadius: '8px', border: '2px solid #4CAF50' }}>
                <h3>📈 Learning Score</h3>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#4CAF50', marginBottom: '10px' }}>
                  {demoMetrics.metrics.learning_score.toFixed(1)}/100
                </div>
                <p>Mastery Level: <strong style={{ fontSize: '18px' }}>{demoMetrics.metrics.mastery_level}</strong></p>
                {renderProgressBar(demoMetrics.metrics.learning_score)}
              </div>

              <div style={{ padding: '20px', backgroundColor: '#fff3e0', borderRadius: '8px' }}>
                <h3>✅ Performance</h3>
                <div><strong>Quiz Attempts:</strong> {demoMetrics.metrics.total_quiz_attempts}</div>
                <div><strong>Average Score:</strong> {demoMetrics.metrics.average_quiz_score.toFixed(1)}%</div>
                <div><strong>Documents:</strong> {demoMetrics.metrics.total_documents}</div>
                <div><strong>Learning Streak:</strong> {demoMetrics.metrics.learning_streak} days 🔥</div>
              </div>

              <div style={{ padding: '20px', backgroundColor: '#f3e5f5', borderRadius: '8px' }}>
                <h3>📚 Learning Path</h3>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#9C27B0', marginBottom: '10px' }}>
                  {demoMetrics.metrics.learning_path_progress.toFixed(1)}%
                </div>
                {renderProgressBar(demoMetrics.metrics.learning_path_progress)}
              </div>
            </div>

            {demoMetrics.metrics.professional_badges.length > 0 && (
              <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#fff8e1', borderRadius: '8px', border: '2px solid #FFD700' }}>
                <h3>🏆 Professional Badges & Achievements</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
                  {demoMetrics.metrics.professional_badges.map((badge, idx) => (
                    <div key={idx} style={{
                      padding: '15px',
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      border: '2px solid #FFD700',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      fontSize: '16px'
                    }}>
                      {badge}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h3 style={{ marginTop: '30px' }}>🎯 Professional Skills Progress</h3>
            {renderSkillBars(demoMetrics.skill_progress)}

            {demoMetrics.professional_achievements.length > 0 && (
              <div style={{ marginTop: '30px' }}>
                <h3>🌟 Recent Achievements</h3>
                <div style={{ display: 'grid', gap: '15px' }}>
                  {demoMetrics.professional_achievements.map((achievement, idx) => (
                    <div key={idx} style={{
                      padding: '15px',
                      backgroundColor: '#e3f2fd',
                      borderRadius: '8px',
                      borderLeft: '4px solid #2196F3'
                    }}>
                      <div><strong>{achievement.badge}</strong> - {achievement.tier}</div>
                      <div>{achievement.description}</div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                        {new Date(achievement.date).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
