# 📚 Novelgram v3 - Global Edition

A modern, multilingual web novel reading and writing platform supporting 25+ languages with full RTL support.

## ✨ What's New in v3

### 🌍 Multilingual Support
- **25+ Languages** with native translations
- **Full RTL Support** for Arabic, Persian, Urdu, Hebrew
- **Language-specific sections** on homepage
- **Auto-detection** of browser language
- **Language switching** without page reload

### 💰 Payment System (BSC)
- **USDT (BEP-20)** deposits via BNB Smart Chain
- **Novelgram Coins (NGC)** - 1 USDT = 1000 NGC
- **Automated verification** via BscScan API
- **Feature Store** with premium perks
- **Withdrawal system** for authors

### 🏪 Feature Store
- Username colors and badges
- VIP status and animated avatars
- Comment highlighting
- Early chapter access
- Custom reading themes

### 📱 Enhanced UI
- **Responsive design** - mobile-first
- **Dark/Light/Sepia** reading themes
- **Font size** adjustment (12-24px)
- **Smooth animations** and transitions
- **Bottom navigation** for mobile

## 🌐 Supported Languages

| Language | Code | Flag | Direction |
|----------|------|------|-----------|
| English | en | 🇺🇸 | LTR |
| Arabic | ar | 🇸🇦 | **RTL** |
| French | fr | 🇫🇷 | LTR |
| Spanish | es | 🇪🇸 | LTR |
| German | de | 🇩🇪 | LTR |
| Chinese | zh | 🇨🇳 | LTR |
| Japanese | ja | 🇯🇵 | LTR |
| Korean | ko | 🇰🇷 | LTR |
| Russian | ru | 🇷🇺 | LTR |
| Turkish | tr | 🇹🇷 | LTR |
| Hindi | hi | 🇮🇳 | LTR |
| Portuguese | pt | 🇧🇷 | LTR |
| Italian | it | 🇮🇹 | LTR |
| Indonesian | id | 🇮🇩 | LTR |
| Thai | th | 🇹🇭 | LTR |
| Vietnamese | vi | 🇻🇳 | LTR |
| Polish | pl | 🇵🇱 | LTR |
| Dutch | nl | 🇳🇱 | LTR |
| Swedish | sv | 🇸🇪 | LTR |
| Persian | fa | 🇮🇷 | **RTL** |
| Urdu | ur | 🇵🇰 | **RTL** |
| Bengali | bn | 🇧🇩 | LTR |
| Tamil | ta | 🇮🇳 | LTR |
| Malay | ms | 🇲🇾 | LTR |
| Filipino | fil | 🇵🇭 | LTR |

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom RTL support
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Payments**: BSC Blockchain (USDT BEP-20)
- **i18n**: react-i18next + LanguageDetector
- **State**: Zustand + React Context
- **Icons**: Lucide React

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- BscScan API Key (free)

### 1. Clone and Install
```bash
git clone <your-repo>
cd novelgram
npm install
```

### 2. Install i18n Dependencies
```bash
npm install react-i18next i18next i18next-browser-languagedetector
```

### 3. Setup Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Run SQL migrations in order:
   - `001_initial_schema.sql`
   - `002_bsc_payment_schema.sql`
   - `003_language_schema.sql`
3. Enable Email Auth in Authentication settings

### 4. Environment Variables
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_BSCSCAN_API_KEY=your-bscscan-api-key
```

Get free BscScan API Key at [bscscan.com/apis](https://bscscan.com/apis)

### 5. Configure Payment Address

Edit `src/utils/bsc_payment.ts`:
```typescript
const DEPOSIT_ADDRESS = '0xYOUR_BSC_ADDRESS_HERE';
```

### 6. Run Development Server
```bash
npm run dev
```

## 🗂️ Project Structure

```
novelgram/
├── src/
│   ├── i18n/
│   │   ├── config.ts          # i18n configuration
│   │   └── locales/           # Translation files
│   │       ├── en.json
│   │       ├── ar.json
│   │       ├── fr.json
│   │       └── ... (25 languages)
│   ├── components/
│   │   ├── common/
│   │   │   └── LanguageSelector.tsx
│   │   ├── layout/
│   │   ├── novels/
│   │   ├── library/
│   │   ├── studio/
│   │   └── profile/
│   ├── pages/
│   │   ├── DiscoverPage.tsx       # With language sections
│   │   ├── LanguageNovelsPage.tsx # Language-specific page
│   │   ├── LibraryPage.tsx
│   │   ├── BookmarksPage.tsx
│   │   ├── StudioPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── NovelPage.tsx
│   │   ├── ChapterPage.tsx
│   │   ├── SearchPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── DepositPage.tsx
│   │   ├── FeatureStorePage.tsx
│   │   └── WithdrawalPage.tsx
│   ├── types/
│   │   └── index.ts              # With language types
│   ├── utils/
│   │   ├── api.ts
│   │   ├── helpers.ts
│   │   └── bsc_payment.ts        # BSC payment system
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   └── App.tsx
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_bsc_payment_schema.sql
│       └── 003_language_schema.sql
└── ...
```

## 🌍 Adding a New Language

### 1. Create Translation File
Create `src/i18n/locales/[code].json` with all translations.

### 2. Register in Config
Edit `src/i18n/config.ts`:
```typescript
import [code] from './locales/[code].json';

const resources = {
  // ... existing languages
  [code]: { translation: [code] },
};

export const LANGUAGE_NAMES = {
  // ... existing
  [code]: 'Language Name',
};

export const LANGUAGE_FLAGS = {
  // ... existing
  [code]: '🇪🇺',
};
```

### 3. Add to Supported Languages
Edit `src/types/index.ts`:
```typescript
export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  // ... existing
  { code: '[code]', name: 'Language', nativeName: 'Native', flag: '🇪🇺', isRTL: false, direction: 'ltr' },
];
```

### 4. Update Database
```sql
-- Novels in new language will be automatically supported
-- No schema changes needed
```

## 💰 Payment System

### Deposit (Add Balance)
1. User sends USDT (BEP-20) to deposit address
2. User copies TxID from wallet
3. User pastes TxID on deposit page
4. System verifies on BSC blockchain
5. Balance added automatically (1 USDT = 1000 NGC)

### Withdraw (For Authors)
1. Author requests withdrawal
2. System processes automatically
3. USDT sent to author's BSC address
4. Processing time: 1-24 hours

### Feature Store
- Purchase premium features with NGC
- Features: badges, colors, early access, etc.
- Some features are permanent, some expire

## 🔐 Security

### Payment Security
- **No private keys** in code
- **Address only** for deposits
- **TxID verification** on blockchain
- **12 confirmations** required
- **Unique TxID** check (no double-spending)

### Data Security
- Row Level Security (RLS) policies
- Encrypted private keys (for hot wallet)
- Environment variables for secrets
- No sensitive data in logs

## 🎯 Features by User Type

### Readers
- Discover novels in any language
- Read with custom themes
- Bookmark progress
- Comment and rate
- Purchase premium features
- Support authors with donations

### Authors
- Create and manage novels
- Schedule chapter releases
- View analytics dashboard
- Withdraw earnings
- Build fan community

### Admins
- Manage users and content
- View platform analytics
- Process withdrawals
- Manage feature store
- Monitor transactions

## 📱 Mobile Optimization

- Bottom navigation for thumb access
- Touch-friendly buttons (min 44px)
- Responsive grid layouts
- Safe area insets
- Smooth scrolling
- Offline reading (coming soon)

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm i -g vercel
vercel --prod
```

### Deploy to Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add translations for your language
4. Submit pull request

## 📄 License

MIT License - free for personal and commercial use.

## 🙏 Credits

Built with ❤️ for the global reading and writing community.

Special thanks to:
- Webnovel, Royal Road, Wattpad for inspiration
- Binance Smart Chain for payment infrastructure
- Supabase for backend services
- All contributors and translators

---

**Novelgram** - Stories that ping you back, in every language..
