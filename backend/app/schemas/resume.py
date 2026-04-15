"""
简历相关 Pydantic 模型
"""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# ========== 基础模型 ==========

class ResumeBase(BaseModel):
    """简历基础模型"""
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    is_base_resume: bool = False


class ResumeCreate(ResumeBase):
    """简历创建模型"""
    pass


class ResumeUpdate(BaseModel):
    """简历更新模型"""
    title: str | None = Field(None, min_length=1, max_length=200)
    content: str | None = Field(None, min_length=1)
    is_base_resume: bool | None = None


class ResumeInDB(ResumeBase):
    """数据库简历模型"""
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime


class ResumeResponse(ResumeInDB):
    """简历响应模型"""
    pass


class ResumeList(BaseModel):
    """简历列表响应"""
    items: list[ResumeResponse]
    total: int
