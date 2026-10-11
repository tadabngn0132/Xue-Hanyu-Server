# Technical Specification — Xue Hanyu Backend

**Trạng thái:** As-is — mô tả implementation hiện tại  
**Ngày chụp trạng thái:** 11/10/2026  
**Repository:** `XueHanyuServer`  
**Package version:** `1.0.0`  
**Commit khảo sát:** `006d87a` — Setup Express server with ES modules, helmet, morgan, and dotenv

## 1. Mục tiêu và trạng thái

Backend được định hướng cung cấp API quản lý từ vựng cho Xue Hanyu theo kiến trúc route → controller → service → data store.

Phiên bản hiện tại mới là skeleton:

- Đã tạo Express application và khai báo bốn route CRUD cho `word`.
- Controller và service chưa có implementation.
- Chưa có database/model/repository.
- Chưa có endpoint lấy danh sách từ.
- Server hiện không khởi động được do import `wordRoutes.js` không khớp file thực tế `wordRoute.js`.
- Frontend chưa gọi Backend.

## 2. Kiến trúc

```text
HTTP request
    |
    v
Express application
    |
    v
wordRoute -> wordController -> wordService -> data store
                                              (chưa có)
```

Chỉ lớp route đã được khai báo. Controller không gọi service và service không kết nối nguồn dữ liệu.

## 3. Technology stack

| Hạng mục | Công nghệ/trạng thái |
|---|---|
| Runtime | Node.js ES Modules |
| Web framework | Express 5.2.x |
| Environment | dotenv 17.4.x |
| Security headers | helmet 8.3.x, đã cài nhưng chưa mount |
| HTTP logging | morgan 1.12.x, đã cài nhưng chưa mount |
| Development reload | nodemon 3.1.x, chưa có script |
| Database/ORM | Chưa có |
| Validation | Chưa có |
| Authentication | Chưa có |
| Test framework | Chưa có |

## 4. Cấu trúc module

```text
XueHanyuServer/
├── server.js
└── src/
    ├── config/
    │   ├── envConfig.js
    │   └── index.js
    ├── routes/
    │   ├── wordRoute.js
    │   └── index.js
    ├── controllers/
    │   ├── wordController.js
    │   └── index.js
    ├── services/
    │   ├── wordService.js
    │   └── index.js
    ├── middlewares/index.js
    └── utils/index.js
```

| Module | Trách nhiệm hiện tại |
|---|---|
| `server.js` | Tạo app, parse JSON, mount routes và listen port 3000 |
| `config/envConfig.js` | Đọc `NODE_ENV`, `NODE_PORT`, `DATABASE_URL` |
| `routes/wordRoute.js` | Khai báo các URL CRUD |
| `controllers/wordController.js` | Khai báo controller rỗng |
| `services/wordService.js` | Khai báo service rỗng |
| `middlewares/index.js` | Placeholder |
| `utils/index.js` | Placeholder |

## 5. Bootstrap và configuration

`server.js` dự kiến:

1. Tạo Express application.
2. Mount `express.json()`.
3. Mount word router tại `/api`.
4. Listen trên port 3000.

Biến môi trường đã khai báo:

| Biến | Default | Trạng thái sử dụng |
|---|---|---|
| `NODE_ENV` | `development` | Được đọc nhưng chưa dùng |
| `NODE_PORT` | `3000` | Được đọc nhưng server vẫn hard-code `3000` |
| `DATABASE_URL` | Chuỗi rỗng | Được đọc nhưng chưa có database client |

Không ghi giá trị `.env` thực tế vào tài liệu hoặc source control.

## 6. API surface hiện tại

Base URL dự kiến sau khi sửa lỗi khởi động: `http://localhost:3000/api`

| Method | Path | Controller | Ý định |
|---|---|---|---|
| `GET` | `/word/:id` | `getWord` | Lấy một từ theo ID |
| `POST` | `/word` | `createWord` | Tạo từ mới |
| `PUT` | `/word/:id` | `updateWord` | Cập nhật từ |
| `DELETE` | `/word/:id` | `deleteWord` | Xóa từ |

### Trạng thái thực thi

Route index import `./wordRoutes.js`, nhưng file hiện có là `wordRoute.js`. Node trả `ERR_MODULE_NOT_FOUND`; server không thể khởi động.

Sau khi sửa import, controller vẫn có function body rỗng:

- Không đọc `req.params` hoặc `req.body`.
- Không gọi service.
- Không gửi status/body và không kết thúc response.
- Request sẽ chờ đến khi client hoặc proxy timeout.

Vì vậy bảng route trên chỉ mô tả API surface dự kiến, chưa phải contract có thể sử dụng.

## 7. Service và persistence

Các service đã được export nhưng chưa triển khai:

- `getWordById(id)`
- `createWord(wordData)`
- `updateWord(id, wordData)`
- `deleteWord(id)`

Backend chưa có:

- Entity/model `Word`.
- Database driver hoặc ORM.
- Migration và seed.
- Repository/data-access layer.
- Transaction strategy.
- Cơ chế sinh ID hoặc xử lý conflict.

Bộ 282 từ hiện chỉ nằm ở Frontend và Backend không truy cập được.

## 8. Data model mục tiêu

Đây là schema đề xuất dựa trên dữ liệu Frontend, không phải model đã được triển khai:

```ts
type Word = {
  id: number;
  word: string;
  pinyin: string;
  english: string;
  vietnamese: string;
  example: string;
  lesson: number;
};
```

Ràng buộc tối thiểu đề xuất:

- `id`: số nguyên dương, unique.
- `word`, `pinyin`, `english`, `vietnamese`, `example`: string không rỗng.
- `lesson`: số nguyên dương.
- Dữ liệu Unicode phải được lưu và trả về dưới UTF-8.

Nên cân nhắc tách `example` thành `exampleChinese` và `exampleTranslation` trước khi chốt migration dài hạn.

## 9. Contract API mục tiêu

Phần này là đề xuất cho mốc tích hợp đầu tiên.

### Danh sách và lọc theo bài

```http
GET /api/words?lesson=1
```

```json
{
  "data": [
    {
      "id": 1,
      "word": "你",
      "pinyin": "nǐ",
      "english": "you",
      "vietnamese": "bạn",
      "example": "你好！很高兴见到你。 (Hello! Nice to meet you.)",
      "lesson": 1
    }
  ],
  "meta": { "total": 23 }
}
```

### Error format

```json
{
  "error": {
    "code": "WORD_NOT_FOUND",
    "message": "Không tìm thấy từ vựng."
  }
}
```

Status code tối thiểu:

| Status | Trường hợp |
|---:|---|
| `200` | Đọc/cập nhật thành công |
| `201` | Tạo thành công |
| `204` | Xóa thành công, không có response body |
| `400` | Params/query/body không hợp lệ |
| `404` | Không tìm thấy từ |
| `409` | Vi phạm unique/conflict |
| `500` | Lỗi ngoài dự kiến |

Các quyết định còn cần chốt: `PUT` thay thế toàn bộ hay cập nhật một phần; pagination; sort; format validation error; ID do client hay server tạo.

## 10. Middleware và bảo mật

Hiện chỉ có `express.json()` được mount. Chưa có:

- CORS hoặc reverse-proxy policy.
- Helmet dù dependency đã cài.
- HTTP access logging dù Morgan đã cài.
- Request validation/sanitization.
- Authentication/authorization.
- Rate limiting.
- 404 handler và centralized error handler.
- Giới hạn JSON body được cấu hình rõ ràng.

Trước khi mở CRUD ra ngoài mạng tin cậy, cần có validation, authentication/authorization và giới hạn request phù hợp.

## 11. Observability và reliability

Hiện tại:

- Chỉ log khi server listen thành công.
- Chưa có structured log, request ID, metrics hoặc tracing.
- Chưa có health/readiness endpoint.
- Chưa có graceful shutdown.
- Chưa có retry/timeout cho data store.
- Chưa có backup/migration policy vì chưa có database.

## 12. Build, test và vận hành

`package.json` chưa có script `start` hoặc `dev`. Lệnh dự kiến:

```bash
cd XueHanyuServer
npm install
node server.js
```

Kết quả xác minh ngày 11/10/2026:

- Syntax check cho các file chính: **pass**.
- Runtime startup: **fail** với `ERR_MODULE_NOT_FOUND` do mismatch `wordRoutes.js`/`wordRoute.js`.
- `npm test`: script placeholder, luôn exit 1.
- Chưa có build step vì source JavaScript chạy trực tiếp bằng Node.js.

## 13. Rủi ro và technical debt

1. **P0 — Server không khởi động:** import route trỏ sai tên file.
2. **P0 — API treo request sau khi sửa import:** controller không kết thúc response.
3. **P0 — Không có data source:** service và persistence chưa được triển khai.
4. **P1 — Thiếu endpoint danh sách:** FE không thể tải toàn bộ từ hoặc lọc theo bài.
5. **P1 — Thiếu validation/error contract:** CRUD chưa kiểm soát input/output.
6. **P1 — Thiếu CORS/proxy và security middleware:** chưa sẵn sàng tích hợp/deploy.
7. **P2 — Port hard-code:** `NODE_PORT` không điều khiển server.
8. **P2 — Không có automated test hoặc CI.**
9. **P2 — Dữ liệu chỉ nằm ở FE:** có nguy cơ hai nguồn dữ liệu khi bắt đầu migration.
10. **P3 — Dependencies chưa dùng:** Helmet, Morgan và Nodemon chưa được nối vào runtime/scripts.

## 14. Lộ trình đề xuất

### Mốc 1 — Khởi động và nền tảng API

- Sửa tên file/import route.
- Dùng `envConfig.NODE_PORT` và bổ sung `start`, `dev`, `test` scripts.
- Mount Helmet, Morgan, CORS, 404 và error middleware.
- Bổ sung health/readiness endpoint.

### Mốc 2 — Data và contract

- Chọn database/ORM và tạo model/migration `Word`.
- Seed 282 từ từ dataset hiện tại.
- Chốt validation và response/error schema.
- Thêm `GET /api/words`, lọc theo lesson và hoàn thiện CRUD.
- Viết unit test cho service và integration test cho API.

### Mốc 3 — Production readiness

- Thêm authentication/authorization cho API ghi dữ liệu.
- Thiết lập structured logging, metrics và graceful shutdown.
- Thêm CI chạy lint/test và migration check.
- Xác định backup, rollback và deployment topology.

## 15. Definition of Done cho mốc tích hợp đầu tiên

- Server khởi động bằng script và port lấy từ environment.
- `GET /api/words` trả đủ 282 từ và lọc đúng theo bài.
- CRUD có validation, status code và error body thống nhất.
- Database được tạo bằng migration và dữ liệu được nạp bằng seed có thể lặp lại an toàn.
- CORS hoặc reverse proxy cho phép FE truy cập theo allowlist đã chốt.
- Health check, 404 và centralized error handler hoạt động.
- Unit/integration test đều pass trong CI.
- Không có secret được commit vào repository.

## 16. Ngoài phạm vi hiện tại

- Đăng nhập, user profile và role management.
- Lưu tiến độ học hoặc spaced repetition.
- Audio/phát âm.
- Analytics học tập.
- Import/export và giao diện quản trị nội dung.

