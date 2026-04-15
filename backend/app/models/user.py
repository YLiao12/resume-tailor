"""
用户模型
"""
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, LargeBinary, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.encryption import encryption
from app.core.security import get_password_hash, verify_password
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.resume import Resume


class User(Base):
    """用户模型"""

    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    encrypted_api_key: Mapped[bytes | None] = mapped_column(LargeBinary, nullable=True)

    # 关联关系
    resumes: Mapped[list["Resume"]] = relationship(
        "Resume", back_populates="user", cascade="all, delete-orphan"
    )

    def set_password(self, password: str) -> None:
        """设置密码"""
        self.hashed_password = get_password_hash(password)

    def verify_password(self, password: str) -> bool:
        """验证密码"""
        return verify_password(password, self.hashed_password)

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
