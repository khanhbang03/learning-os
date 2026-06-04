# Deployment Guide - GitHub Pages

Hướng dẫn triển khai Learning OS 2.0 lên GitHub Pages tại: `https://khanhbang03.github.io/learning-os/`

---

## 🚀 Cách 1: Tự động Deploy với GitHub Actions (Recommended)

### Step 1: Đẩy code lên GitHub

```bash
cd "c:\Users\dellxps\Downloads\Learning OS"

# Nếu chưa init git repo
git init
git add .
git commit -m "Initial commit: Learning OS 2.0"
git branch -M main
git remote add origin https://github.com/khanhbang03/learning-os.git
git push -u origin main
```

### Step 2: GitHub Actions sẽ tự động chạy

- GitHub Actions sẽ tự động:
  1. Checkout code
  2. Install dependencies
  3. Build frontend (`npm run build`)
  4. Deploy `dist/` folder tới GitHub Pages

- Xem tiến trình:
  - Vào repo: https://github.com/khanhbang03/learning-os
  - Click "Actions" tab
  - Xem "Deploy to GitHub Pages" workflow

### Step 3: Truy cập trang

Sau 1-2 phút, trang sẽ có sẵn tại:
```
https://khanhbang03.github.io/learning-os/
```

---

## 📝 Cách 2: Build & Deploy Thủ Công

### Step 1: Build Frontend

```bash
cd frontend
npm install
npm run build
```

Sẽ tạo ra thư mục `frontend/dist/` chứa các file static.

### Step 2: Tạo branch `gh-pages`

```bash
# Từ root directory
cd frontend

# Build lại nếu chưa
npm run build

# Tạo và checkout nhánh gh-pages
cd ..
git checkout --orphan gh-pages
git rm -rf .
```

### Step 3: Copy built files

```bash
# Copy dist folder content lên gh-pages branch
robocopy frontend\dist .\ /E  # Windows
# hoặc trên Mac/Linux:
# cp -r frontend/dist/* .

# Add và commit
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

### Step 4: Configure GitHub Pages Settings

1. Vào repo: https://github.com/khanhbang03/learning-os
2. Settings → Pages
3. Build and deployment:
   - Source: Deploy from a branch
   - Branch: `gh-pages`
   - Folder: `/ (root)`
4. Click Save

Sau đó trang sẽ có sẵn tại: `https://khanhbang03.github.io/learning-os/`

---

## 🔧 Configuration Checks

### ✅ vite.config.ts
```typescript
export default defineConfig({
  base: '/learning-os/',  // Important! Must have /learning-os/
  plugins: [react()],
  // ...
})
```

### ✅ package.json
```json
{
  "scripts": {
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

### ✅ .gitignore
Đảm bảo các files dưới đây được ignore:
```
node_modules/
dist/
.env
.env.local
.venv/
```

---

## 🌐 Backend API Configuration

Lưu ý: GitHub Pages chỉ có thể host **static files** (HTML, CSS, JS).

### Option 1: Local Backend (Development)
```
Frontend: http://localhost:5173 → Backend: http://localhost:8000
```
Proxy được config trong vite.config.ts

### Option 2: Deployed Backend (Production)
Khi deploy lên GitHub Pages, bạn cần:

1. **Deploy Backend riêng** (ví dụ: Heroku, Railway, Render, AWS)

2. **Update API endpoint** trong frontend:
   
   Tạo file `frontend/src/api.ts`:
   ```typescript
   const API_URL = process.env.VITE_API_URL || 'http://localhost:8000/api';
   
   export const api = axios.create({
     baseURL: API_URL,
   });
   ```

3. **Update App.tsx** để sử dụng:
   ```typescript
   import { api } from './api';
   
   const response = await api.post('/upload', formData);
   ```

4. **Tạo file `.env.production`** cho production:
   ```
   VITE_API_URL=https://your-backend.herokuapp.com/api
   ```

---

## 📋 Troubleshooting

### ❌ 404 Error khi truy cập /learning-os/
**Giải pháp:**
- Đảm bảo `vite.config.ts` có `base: '/learning-os/'`
- Rebuild: `npm run build`
- Xoá `.git/caches/` nếu cần
- Wait 5 minutes for GitHub Pages to update

### ❌ Blank page / No styles loading
**Giải pháp:**
- Kiểm tra Network tab (DevTools)
- Đảm bảo assets được load từ `/learning-os/static/`
- Check Browser Console for errors

### ❌ API calls failing (CORS error)
**Giải pháp:**
- Nếu backend on localhost: Không sử dụng GitHub Pages để dev
- Deploy backend công cộng
- Backend phải enable CORS: `Access-Control-Allow-Origin: *`

### ❌ GitHub Actions deploy fails
**Giải pháp:**
- Check Actions tab for error logs
- Verify package.json có script `build`
- Đảm bảo `npm install` thành công
- Check node version compatibility

---

## ✨ Advanced: Custom Domain (Optional)

Nếu bạn muốn dùng custom domain (ví dụ: `learning-os.com`):

1. Mua domain
2. GitHub Pages → Settings → Custom domain
3. Thêm CNAME record tại domain provider
4. Verify

---

## 📊 Deploy Checklist

- [ ] Repository created on GitHub
- [ ] Code pushed to main branch
- [ ] `vite.config.ts` có `base: '/learning-os/'`
- [ ] `package.json` có script `build`
- [ ] `.gitignore` setup
- [ ] GitHub Pages settings configured (gh-pages branch hoặc Actions)
- [ ] Workflow file `.github/workflows/deploy.yml` created
- [ ] First push completed → GitHub Actions triggered
- [ ] Wait 2-3 minutes for build
- [ ] Trang accessible tại https://khanhbang03.github.io/learning-os/

---

## 🎯 Next Steps

### Sau khi Frontend Deploy thành công:

1. **Deploy Backend** (nếu cần)
   - Vercel, Railway, Render, Heroku, AWS, GCP
   - Update API endpoint trong frontend

2. **Add Custom Domain** (optional)
   - Point domain tới GitHub Pages

3. **Setup HTTPS**
   - GitHub Pages tự động setup SSL

4. **Add Analytics** (optional)
   - Google Analytics, Mixpanel, etc.

5. **Monitor Performance**
   - GitHub Pages Dashboard
   - Lighthouse scores
   - Error tracking

---

## 📚 Useful Links

- GitHub Pages Docs: https://pages.github.com/
- Vite Base Config: https://vitejs.dev/config/#base
- GitHub Actions: https://docs.github.com/en/actions
- Deploying React + Vite: https://docs.vitejs.dev/guide/static-deploy.html#github-pages

---

## 💡 Tips

1. **Development**: `npm run dev` on localhost
2. **Testing**: `npm run build && npm run preview`
3. **Production**: Push to main → GitHub Actions auto-deploys
4. **Fast iterations**: Use GitHub Actions for automatic deploys
5. **Backend**: Deploy separately, update endpoint in frontend

---

**Created**: June 4, 2024  
**Status**: Ready for Production  
**Support**: Check GitHub Discussions or Issues
