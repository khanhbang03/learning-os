const uploadForm = document.getElementById('upload-form');
const demoOutput = document.getElementById('demo-output');
const mockFileInput = document.getElementById('mock-file');
const tryDemoBtn = document.getElementById('try-demo');

tryDemoBtn?.addEventListener('click', () => {
  document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
});

uploadForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const file = mockFileInput.files?.[0];
  if (!file) {
    alert('Vui lòng chọn một file để demo.');
    return;
  }

  demoOutput.classList.remove('hidden');
  const fileName = file.name.toLowerCase();
  const summary = document.querySelector('.output-block:nth-of-type(1) p');
  const plan = document.querySelector('.output-block:nth-of-type(4) p');

  if (fileName.includes('sql')) {
    summary.textContent = 'SQL Join và Window Functions là nền tảng để xử lý dữ liệu hiệu quả. Học kỹ các phép nối và kỹ thuật tổng hợp.';
    plan.textContent = 'Hôm nay: 20 phút ôn SQL Join, 10 câu quiz, 5 phút flashcards, 15 phút practice query.';
  } else if (fileName.includes('python')) {
    summary.textContent = 'Python Data Analysis sử dụng Pandas, Naive Bayes, và trực quan dữ liệu để giải quyết bài toán thực tế.';
    plan.textContent = 'Hôm nay: 25 phút ôn Pandas, 10 câu quiz, 1 mini challenge với dataframe.';
  } else {
    summary.textContent = 'AI tóm tắt nội dung cốt lõi và tạo một lộ trình học tập cá nhân dựa trên chủ đề của tài liệu.';
    plan.textContent = 'Hôm nay: 15 phút đọc summary, 10 câu quiz, 5 phút review flashcards.';
  }
});
