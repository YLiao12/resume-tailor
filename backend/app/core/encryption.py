"""
API Key 加密模块
使用 Fernet 对称加密
"""
from cryptography.fernet import Fernet, InvalidToken

from app.config import settings


class APIKeyEncryption:
    """API Key 加密工具类"""

    def __init__(self):
        self._cipher: Fernet | None = None
        if settings.ENCRYPTION_KEY:
            try:
                self._cipher = Fernet(settings.ENCRYPTION_KEY.encode())
            except ValueError as e:
                raise ValueError(
                    f"Invalid ENCRYPTION_KEY: {e}. "
                    "Run: python -c \"from cryptography.fernet import Fernet; "
                    "print(Fernet.generate_key().decode())\""
                )

    def encrypt(self, plaintext: str) -> bytes:
        """加密 API Key"""
        if not self._cipher:
            raise RuntimeError("ENCRYPTION_KEY not configured")
        return self._cipher.encrypt(plaintext.encode())

    def decrypt(self, ciphertext: bytes) -> str:
        """解密 API Key"""
        if not self._cipher:
            raise RuntimeError("ENCRYPTION_KEY not configured")
        try:
            return self._cipher.decrypt(ciphertext).decode()
        except InvalidToken:
            raise ValueError("Invalid or corrupted API key encryption")

    def is_configured(self) -> bool:
        """检查是否已配置加密密钥"""
        return self._cipher is not None


# 全局单例
encryption = APIKeyEncryption()
