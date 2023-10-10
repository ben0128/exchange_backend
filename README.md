# My Full-Stack Project 美股、加密貨幣虛擬單交易所

這是一個前後分離的個人全端專案，包括 Vue.js 前端、Node.js + Express 後端，以及 Python 爬蟲。(DEMO 第一次登入需要啟動伺服器會需要比較久，限價單的成交功能需要額外開啟爬蟲平台)

## 目錄

- [成品 DEMO](https://exchange-frontend-tawny.vercel.app/auth)
- [前端 Github (exchange_frontend)](https://github.com/ben0128/exchange_frontend)
- [後端 Github (exchange_backend)](https://github.com/ben0128/exchange_backend)
- [爬蟲 Github (exchange_webhook)](https://github.com/ben0128/exchange_webhook)
- [爬蟲 GoogleColab](https://colab.research.google.com/drive/17FRMISQP6yoO30lUh37KHygg6OfTRg3k?hl=zh-tw#scrollTo=jHpwx_5cW_SB)

### Download Project

```
git clone https://github.com/ben0128/exchange_backend.git
```

### Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Lints and fixes files

```
npm run lint
```

### Dependencies

- axios: ^1.5.1
- bcryptjs: ^2.4.3
- connect-flash: ^0.1.1
- cors: ^2.8.5
- dotenv: ^16.3.1
- express: ^4.18.2
- jsonwebtoken: ^9.0.2
- method-override: ^3.0.0
- mongoose: ^7.5.0
- passport: ^0.6.0
- passport-jwt: ^4.0.1
- passport-local: ^1.0.0

### 功能

- 使用者認證和授權
- 交易資料的創建、讀取、更新和刪除 (CRUD)
- 限價單和市價單成交功能
- CRUD喜好目標

### 環境變數
在`.env`文件中設置以下環境變數：

```plaintext
MONGODB_URL=mongodb://your-database-url
JWT_SECRET=your-secret-key
...