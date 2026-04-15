"""
用户相关 Pydantic 模型
"""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ========== 基础模型 ==========

class UserBase(BaseModel):
    """用户基础模型"""
    email: EmailStr
    full_name: str | None = None


class UserCreate(UserBase):
    """用户创建模型"""
    password: str = Field(..., min_length=8, max_length=100)


class UserUpdate(BaseModel):
    """用户更新模型"""
    full_name: str | None = None


class UserInDB(UserBase):
    """数据库用户模型"""
    model_config = ConfigDict(from_attributes=True)

    id: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime


class UserResponse(UserInDB):
    """用户响应模型"""
    has_api_key: bool = False


# ========== 认证相关 ==========

class Token(BaseModel):
    """令牌模型"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """令牌载荷模型"""
    sub: str | None = None
    type: str | None = None


class LoginRequest(BaseModel):
    """登录请求模型"""
    email: EmailStr
    password: str


# ========== API Key 相关 ==========

class APIKeyCreate(BaseModel):
    """API Key 创建模型"""
    api_key: str = Field(..., min_length=10)


class APIKeyStatus(BaseModel):
    """API Key 状态模型"""
    has_api_key: bool
