# codeseoul

폐쇄형 KOL 매칭 플랫폼 - "비밀 요원" 테마의 지령 기반 미션 센터

## 기술 스택

- **Next.js** (App Router)
- **Tailwind CSS**
- **Supabase** (Auth & Database)
- **lucide-react** (아이콘)
- **framer-motion** (애니메이션)

## 빠른 시작

### 1. 환경 변수 설정

`.env.local.example`을 복사하여 `.env.local`을 생성하고 값을 채우세요:

```bash
cp .env.local.example .env.local
```

`.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
CODESEUL_ADMIN_EMAIL=admin@codeseoul.kr
```

### 2. Supabase 데이터베이스 설정

1. [Supabase](https://supabase.com) 프로젝트 생성
2. SQL Editor에서 `supabase/migrations/001_codeseoul_schema.sql` 내용 실행
3. **관리자 이메일 등록 (필수)** - 없으면 KOL 승인, 미션 등록 등 관리자 기능이 동작하지 않습니다:

```sql
INSERT INTO public.admin_emails (email) VALUES ('your-admin@email.com') ON CONFLICT (email) DO NOTHING;
```

   `.env.local`의 `CODESEUL_ADMIN_EMAIL`과 동일한 이메일을 사용하세요.

4. Supabase Auth에서 이메일/비밀번호 로그인 활성화

5. (선택) 미션 브랜드 이미지 업로드용 Storage 버킷 생성:
   - Supabase Dashboard → Storage → New bucket
   - Name: `campaign-images`, Public bucket: 체크
   - Policies: authenticated 또는 service_role에서 업로드 허용

6. (기존 DB 사용 시) migrations 002, 004 실행:
   - `002_campaign_updates.sql`: recruitment_quota, brand_image_url
   - `004_sns_links.sql`: sns_links (SNS 여러개 지원)

### 3. 개발 서버 실행

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인

## 프로젝트 구조

```
src/
├── app/
│   ├── admin/codeseoul/   # 관리자 대시보드
│   ├── dashboard/         # KOL 미션 센터
│   ├── login, signup      # 인증
│   └── waiting, rejected  # 접근 제어 페이지
├── components/
│   ├── admin/             # KOL 승인, 미션 매니저, 정산 큐
│   ├── auth/              # 로그인/회원가입 폼
│   ├── dashboard/         # 미션 카드, 상세, 내 미션
│   └── ui/                # CopyButton 등
└── lib/
    ├── codeseoul/         # 타입 정의
    └── supabase/          # 클라이언트, 서버, 미들웨어
```

## 주요 기능

### 인증 & 접근 제어

- `approved`: 대시보드 접근 가능
- `pending`: `/waiting` 페이지로 리다이렉트 ("ACCESS DENIED: 서울 본부에서 귀하의 접속 코드를 검증 중입니다.")
- `rejected`: 접근 거절 메시지

### 관리자 대시보드 (`/admin/codeseoul`)

- **KOL 승인 관리**: pending 유저 승인/거절
- **미션 매니저**: 새 미션 등록 / 등록된 미션 목록 분리, 마감일 달력 선택, 브랜드 로고 업로드, 모집 인원
- **지원자 관리**: 지원 검토 후 [선정] → 선정된 KOL만 캠페인 진행 가능
- **정산 큐**: completed 지원 내역에 대해 은행명·계좌번호·금액 복사, [지급 완료]

### KOL 대시보드

- **신규 미션**: active 캠페인 카드, 모집/지원/선정 인원 표기 (예: 5/22 · 선정 3명)
- **미션 상세**: 가이드 확인, [가이드 URL 열기] / [지원하기] 버튼
- **내 미션**: 선정된 캠페인만 표시, 담당자 연락처, 게시물 URL 제출

## 디자인

- 배경: #000000 (Black)
- 텍스트: #FFFFFF (White)
- 포인트: #FF0000 (Neon Red)
- 폰트: JetBrains Mono (고정폭)

## 관리자 기능이 안 될 때

KOL 승인, 미션 등록, 선정, 정산 승인 등이 동작하지 않으면:

1. **admin_emails 테이블 확인**: Supabase SQL Editor에서 실행
   ```sql
   SELECT * FROM admin_emails;
   ```
2. 관리자 이메일이 없으면 추가
   ```sql
   INSERT INTO public.admin_emails (email) VALUES ('hyuun0724@gmail.com') ON CONFLICT (email) DO NOTHING;
   ```
3. `.env.local`의 `CODESEUL_ADMIN_EMAIL`, `NEXT_PUBLIC_CODESEUL_ADMIN_EMAIL`이 admin_emails에 등록한 이메일과 일치하는지 확인
