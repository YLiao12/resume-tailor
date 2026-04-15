# Resume Tailor - 全栈重构需求规格说明书

## 1. 项目概述

将现有的纯前端 HTML 简历定制工具重构为现代化的全栈应用，使用 React + Python FastAPI 架构，支持用户数据持久化存储。

---

## 2. 技术栈

### 前端 (Frontend)
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **状态管理**: Zustand / React Query
- **UI 组件库**: Tailwind CSS + shadcn/ui
- **路由**: React Router v6
- **HTTP 客户端**: Axios
- **Markdown 渲染**: react-markdown
- **PDF 生成**: @react-pdf/renderer (替代 pdfmake)

### 后端 (Backend)
- **框架**: Python 3.11 + FastAPI
- **数据库**: PostgreSQL (生产) 
- **ORM**: SQLAlchemy 2.0 + Alembic (迁移)
- **认证**: JWT (python-jose) + passlib
- **API 文档**: FastAPI 自动生成 Swagger/OpenAPI
- **环境管理**: Pydantic Settings

### 部署
- **容器化**: Docker + Docker Compose
- **反向代理**: Nginx

### 安全
- **API Key 加密**: Fernet 对称加密（服务端存储）
- **密码哈希**: bcrypt
- **传输加密**: HTTPS/TLS

---

## 3. 功能需求

### 3.1 用户认证模块

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 用户注册 | 邮箱 + 密码注册，邮箱验证 | P1 |
| 用户登录 | JWT Token 认证，支持 Refresh Token | P1 |
| 密码重置 | 通过邮箱链接重置密码 | P2 |
| 第三方登录 | Google OAuth (可选) | P3 |

### 3.2 简历管理模块

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 创建简历 | 新建简历，支持 Markdown 编辑器 | P1 |
| 编辑简历 | 实时保存，版本历史 | P1 |
| 删除简历 | 软删除，可恢复 | P1 |
| 简历列表 | 分页展示，搜索筛选 | P1 |
| 简历模板 | 预设模板快速创建 | P2 |
| 导入导出 | Markdown/JSON/Word 导入导出 | P2 |

### 3.3 职位描述 (JD) 管理模块

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 创建 JD | 粘贴职位描述，自动解析 | P1 |
| JD 分析 | AI 提取关键词、技能要求 | P1 |
| 关键词管理 | 手动编辑/添加关键词 | P1 |
| JD 列表 | 关联公司、职位、状态 | P1 |
| JD 匹配度 | 计算简历与 JD 的匹配分数 | P2 |

### 3.4 AI 生成模块

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 简历优化 | 基于 JD 优化简历内容 | P1 |
| 求职信生成 | 自动生成 Cover Letter | P1 |
| 关键词高亮 | 显示匹配的关键词 | P1 |
| 多模型支持 | OpenRouter / OpenAI / 本地模型 | P2 |
| 生成历史 | 保存每次生成结果 | P2 |

### 3.5 导出模块

| 功能 | 描述 | 优先级 |
|------|------|--------|
| PDF 导出 | 专业排版 PDF 简历 | P1 |
| Markdown 导出 | 原始 Markdown 格式 | P1 |
| 求职信导出 | PDF/TXT 格式 | P1 |

---

## 4. 数据库设计

### 4.1 实体关系图 (ERD)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│      users      │     │    resumes      │     │       jds       │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │────<│ user_id (FK)    │     │ id (PK)         │
│ email           │     │ id (PK)         │     │ user_id (FK)    │
│ hashed_password │     │ title           │     │ company_name    │
│ full_name       │     │ content (MD)    │     │ job_title       │
│ created_at      │     │ is_base_resume  │     │ raw_content     │
│ updated_at      │     │ created_at      │     │ parsed_keywords │
│ is_active       │     │ updated_at      │     │ status          │
└─────────────────┘     │ version         │     │ created_at      │
                        └─────────────────┘     │ updated_at      │
                                                └─────────────────┘
                              │
                              │
                              v
                        ┌─────────────────┐     ┌─────────────────┐
                        │  resume_versions│     │ tailored_outputs│
                        ├─────────────────┤     ├─────────────────┤
                        │ id (PK)         │     │ id (PK)         │
                        │ resume_id (FK)  │     │ resume_id (FK)  │
                        │ content         │     │ jd_id (FK)      │
                        │ version_number  │     │ type            │
                        │ created_at      │     │ content         │
                        └─────────────────┘     │ ai_model        │
                                                │ created_at      │
                                                └─────────────────┘
```

### 4.2 表结构详细定义

#### users 表
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### resumes 表
```sql
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,  -- Markdown content
    is_base_resume BOOLEAN DEFAULT FALSE,  -- 标记是否为基准简历
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### job_descriptions 表
```sql
CREATE TABLE job_descriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(200),
    job_title VARCHAR(200),
    raw_content TEXT NOT NULL,
    parsed_keywords JSONB,  -- 解析后的关键词
    status VARCHAR(50) DEFAULT 'active',  -- active, archived, applied
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### tailored_outputs 表 (生成的简历/求职信)
```sql
CREATE TABLE tailored_outputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    base_resume_id UUID REFERENCES resumes(id),
    jd_id UUID REFERENCES job_descriptions(id),
    type VARCHAR(50) NOT NULL,  -- 'resume' or 'cover_letter'
    content JSONB NOT NULL,  -- 结构化内容
    ai_model VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4.3 API Key 加密存储方案

#### 加密原理
- 使用 **Fernet 对称加密**（cryptography 库）
- 主密钥通过环境变量 `ENCRYPTION_KEY` 注入
- 每个用户的 API Key 独立加密存储

#### users 表扩展
```sql
-- 添加加密后的 API Key 字段（已包含在上述 users 表定义中）
-- encrypted_api_key: BYTEA 类型，存储 Fernet 加密后的密文
```

#### 核心代码实现

**加密工具类** (`backend/app/core/encryption.py`):
```python
from cryptography.fernet import Fernet
import os

class APIKeyEncryption:
    def __init__(self):
        # 32字节 base64 编码密钥，从环境变量读取
        self.master_key = os.getenv("ENCRYPTION_KEY")
        if not self.master_key:
            raise ValueError("ENCRYPTION_KEY environment variable is required")
        self.cipher = Fernet(self.master_key)
    
    def encrypt(self, plaintext: str) -> bytes:
        """加密 API Key"""
        return self.cipher.encrypt(plaintext.encode())
    
    def decrypt(self, ciphertext: bytes) -> str:
        """解密 API Key"""
        return self.cipher.decrypt(ciphertext).decode()

# 全局单例
encryption = APIKeyEncryption()
```

**User 模型方法** (`backend/app/models/user.py`):
```python
from sqlalchemy import Column, LargeBinary
from app.core.encryption import encryption

class User(Base):
    __tablename__ = "users"
    
    # ... 其他字段 ...
    encrypted_api_key = Column(LargeBinary, nullable=True)
    
    def set_api_key(self, api_key: str) -> None:
        """设置并加密 API Key"""
        self.encrypted_api_key = encryption.encrypt(api_key)
    
    def get_api_key(self) -> str | None:
        """获取解密后的 API Key"""
        if not self.encrypted_api_key:
            return None
        return encryption.decrypt(self.encrypted_api_key)
    
    def has_api_key(self) -> bool:
        """检查是否已设置 API Key"""
        return self.encrypted_api_key is not None
```

**API 路由** (`backend/app/api/v1/users.py`):
```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, get_db
from app.models import User

router = APIRouter()

@router.post("/api-key", status_code=status.HTTP_204_NO_CONTENT)
async def save_api_key(
    api_key: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """保存用户 OpenRouter API Key（服务端加密存储）"""
    # 可选：验证 API Key 格式或调用测试接口
    current_user.set_api_key(api_key)
    db.commit()

@router.get("/api-key/status")
async def check_api_key_status(
    current_user: User = Depends(get_current_user)
) -> dict:
    """检查用户是否已设置 API Key（不返回密钥本身）"""
    return {"has_api_key": current_user.has_api_key()}

@router.delete("/api-key", status_code=status.HTTP_204_NO_CONTENT)
async def delete_api_key(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除用户 API Key"""
    current_user.encrypted_api_key = None
    db.commit()
```

**AI 服务使用** (`backend/app/services/ai_service.py`):
```python
async def analyze_jd(jd_content: str, user: User) -> dict:
    """分析 JD，自动获取用户 API Key"""
    api_key = user.get_api_key()
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="API Key not configured. Please set your OpenRouter API key."
        )
    
    # 使用 api_key 调用 OpenRouter API
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    # ... 调用逻辑
```

#### 安全要点
1. **前端永不接触密钥**：API Key 只保存在服务端加密存储
2. **内存中短暂解密**：仅在调用 AI API 时临时解密，不缓存
3. **环境隔离**：生产环境 `ENCRYPTION_KEY` 与代码分离
4. **密钥轮换**：支持重新生成主密钥并迁移数据（需额外实现）

---

## 5. API 接口设计

### 5.1 认证相关

```yaml
POST   /api/v1/auth/register       # 用户注册
POST   /api/v1/auth/login          # 用户登录
POST   /api/v1/auth/refresh        # 刷新 Token
POST   /api/v1/auth/logout         # 登出
POST   /api/v1/auth/forgot-password # 忘记密码
POST   /api/v1/auth/reset-password  # 重置密码
```

### 5.2 简历管理

```yaml
GET    /api/v1/resumes              # 获取简历列表
POST   /api/v1/resumes              # 创建简历
GET    /api/v1/resumes/{id}         # 获取单个简历
PUT    /api/v1/resumes/{id}         # 更新简历
DELETE /api/v1/resumes/{id}         # 删除简历
POST   /api/v1/resumes/{id}/duplicate  # 复制简历
```

### 5.3 JD 管理

```yaml
GET    /api/v1/jds                 # 获取 JD 列表
POST   /api/v1/jds                 # 创建 JD
GET    /api/v1/jds/{id}            # 获取单个 JD
PUT    /api/v1/jds/{id}            # 更新 JD
DELETE /api/v1/jds/{id}            # 删除 JD
POST   /api/v1/jds/{id}/analyze    # AI 分析 JD
```

### 5.4 AI 生成

```yaml
POST   /api/v1/ai/analyze-jd       # 分析 JD 提取关键词
POST   /api/v1/ai/generate-resume  # 生成定制简历
POST   /api/v1/ai/generate-cover   # 生成求职信
POST   /api/v1/ai/match-score      # 计算匹配分数
```

### 5.5 导出

```yaml
POST   /api/v1/export/pdf          # 导出 PDF
POST   /api/v1/export/markdown     # 导出 Markdown
POST   /api/v1/export/cover-letter # 导出求职信
```

### 5.6 API Key 管理

```yaml
POST   /api/v1/users/api-key      # 保存/更新 API Key（服务端加密）
GET    /api/v1/users/api-key      # 检查是否已设置 API Key（不返回密钥）
DELETE /api/v1/users/api-key      # 删除 API Key
```

**安全说明：**
- API Key 仅保存在服务端，使用 Fernet 对称加密存储
- 前端永不直接访问原始 API Key
- AI 请求由后端代理，前端只传递业务参数

---

## 6. 前端页面结构

```
/
├── /login                    # 登录页
├── /register                 # 注册页
├── /dashboard                # 仪表盘（简历列表）
│   └── /dashboard/jds        # JD 列表
├── /resumes
│   ├── /resumes/new          # 新建简历
│   └── /resumes/:id/edit     # 编辑简历
├── /jds
│   ├── /jds/new              # 新建 JD
│   └── /jds/:id              # JD 详情 + 生成
├── /settings
│   ├── /settings/profile     # 个人设置
│   └── /settings/api-keys    # API Key 管理
└── /templates                # 简历模板库
```

---

## 7. 项目目录结构

```
resume-tailor/
├── docker-compose.yml
├── README.md
├── .env.example
├──
├── frontend/                    # React 前端
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── index.html
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├──
│   │   ├── components/          # 通用组件
│   │   │   ├── ui/              # shadcn/ui 组件
│   │   │   ├── layout/          # 布局组件
│   │   │   ├── resume/          # 简历相关组件
│   │   │   └── jd/              # JD 相关组件
│   │   ├──
│   │   ├── pages/               # 页面组件
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ResumeEdit.tsx
│   │   │   ├── JDDetail.tsx
│   │   │   └── Settings.tsx
│   │   ├──
│   │   ├── hooks/               # 自定义 Hooks
│   │   ├── stores/              # Zustand 状态管理
│   │   ├── services/            # API 服务
│   │   ├── types/               # TypeScript 类型定义
│   │   ├── utils/               # 工具函数
│   │   └── styles/              # 全局样式
│   └──
│   └── public/                  # 静态资源
│
├── backend/                     # Python FastAPI 后端
│   ├── pyproject.toml
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── alembic.ini
│   ├──
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI 入口
│   │   ├── config.py            # 配置管理
│   │   ├──
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── deps.py          # 依赖注入
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── auth.py      # 认证路由
│   │   │       ├── resumes.py   # 简历路由
│   │   │       ├── jds.py       # JD 路由
│   │   │       ├── ai.py        # AI 路由
│   │   │       └── export.py    # 导出路由
│   │   ├──
│   │   ├── core/
│   │   │   ├── security.py      # JWT/密码处理
│   │   │   └── exceptions.py    # 自定义异常
│   │   ├──
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── resume.py
│   │   │   └── job_description.py
│   │   ├──
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── resume.py
│   │   │   └── job_description.py
│   │   ├──
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── user_service.py
│   │   │   ├── resume_service.py
│   │   │   ├── jd_service.py
│   │   │   └── ai_service.py
│   │   ├──
│   │   └── db/
│   │       ├── __init__.py
│   │       ├── session.py       # 数据库会话
│   │       └── base.py          # 基础模型
│   └──
│   └── alembic/                 # 数据库迁移
│       └── versions/
│
└── nginx/                       # Nginx 配置
    └── default.conf
```

---

## 8. 验收标准

### 8.1 功能验收

| 验收项 | 验收标准 | 测试方法 |
|--------|----------|----------|
| 用户注册 | 新用户可通过邮箱注册，收到验证邮件 | 手动测试 + API 测试 |
| 用户登录 | 正确凭证可登录，错误凭证拒绝并提示 | 单元测试 + 手动测试 |
| JWT 认证 | Token 过期后自动刷新，无效 Token 拒绝访问 | 单元测试 |
| 简历 CRUD | 可创建、读取、更新、删除简历，数据持久化 | API 测试 + E2E 测试 |
| JD 分析 | 粘贴 JD 后 AI 正确提取关键词 | 手动测试 |
| 简历生成 | 基于 JD 生成优化后的简历，关键词自然融入 | 手动测试 |
| PDF 导出 | 导出的 PDF 格式正确，排版美观 | 手动测试 |
| 实时保存 | 编辑简历时自动保存，不丢失数据 | E2E 测试 |

### 8.2 性能验收

| 指标 | 目标值 | 测试方法 |
|------|--------|----------|
| 首屏加载时间 | < 2s | Lighthouse |
| API 响应时间 (P95) | < 500ms | k6 压测 |
| 并发用户数 | 支持 100 并发 | k6 压测 |
| AI 生成时间 | < 30s | 手动测试 |

### 8.3 安全验收

| 验收项 | 标准 | 测试方法 |
|--------|------|----------|
| 密码存储 | bcrypt 加密，不存储明文 | 代码审查 |
| SQL 注入 | 使用 ORM，无拼接 SQL | 代码审查 + SQLMap |
| XSS 防护 | 输出转义，CSP 头 | 代码审查 |
| CSRF 防护 | JWT 无 CSRF 问题 | 代码审查 |
| 敏感信息 | API Key 不泄露到前端 | 代码审查 |
| API Key 加密 | Fernet 加密存储，内存中临时解密 | 代码审查 + 渗透测试 |

### 8.4 代码质量验收

| 指标 | 目标 | 工具 |
|------|------|------|
| 前端测试覆盖率 | > 70% | Vitest + React Testing Library |
| 后端测试覆盖率 | > 80% | pytest |
| TypeScript 严格模式 | 启用 | tsc --noEmit |
| Python 类型检查 | 通过 | mypy |
| 代码风格 | 统一 | ESLint + Prettier / Ruff + Black |

---

## 9. 开发里程碑

### Phase 1: 基础架构 (Week 1-2)
- [ ] 项目脚手架搭建
- [ ] Docker 环境配置
- [ ] 数据库设计 + 迁移
- [ ] 基础 CI/CD 流程

### Phase 2: 认证 + 简历管理 (Week 3-4)
- [ ] 用户注册/登录
- [ ] JWT 认证中间件
- [ ] 简历 CRUD API
- [ ] 简历编辑器前端

### Phase 3: JD 管理 + AI 集成 (Week 5-6)
- [ ] JD CRUD
- [ ] OpenRouter AI 集成
- [ ] 关键词提取
- [ ] 简历生成功能

### Phase 4: 导出 + 优化 (Week 7-8)
- [ ] PDF 导出
- [ ] 求职信生成
- [ ] 性能优化
- [ ] 测试完善

### Phase 5: 部署 (Week 9)
- [ ] 生产环境配置
- [ ] 监控告警
- [ ] 文档完善

---

## 10. 风险与应对

| 风险 | 影响 | 应对措施 |
|------|------|----------|
| AI API 不稳定 | 高 | 实现重试机制，支持多模型切换 |
| 数据库性能瓶颈 | 中 | 添加索引，考虑缓存层 |
| 前端构建体积大 | 中 | 代码分割，懒加载 |
| 安全漏洞 | 高 | 代码审查，依赖扫描，定期更新 |

---

## 11. 附录

### 11.1 参考文档
- [FastAPI 官方文档](https://fastapi.tiangolo.com/)
- [React 官方文档](https://react.dev/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [shadcn/ui 文档](https://ui.shadcn.com/)

### 11.2 生成加密密钥

```bash
# Python 生成 Fernet 密钥
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# 输出示例: xJ3vPq9mNcRfUjXn2r5u8x/A?D(G+KbP
# 将结果添加到 .env 文件的 ENCRYPTION_KEY 变量
```

### 11.3 相关命令

```bash
# 启动开发环境
docker-compose up -d

# 前端开发
cd frontend && npm run dev

# 后端开发
cd backend && uvicorn app.main:app --reload

# 数据库迁移
cd backend && alembic revision --autogenerate -m "init"
cd backend && alembic upgrade head

# 运行测试
# 前端
cd frontend && npm test

# 后端
cd backend && pytest
```
