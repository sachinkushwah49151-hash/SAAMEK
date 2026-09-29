"""SAAMEK Backend Exception Hierarchy"""
from typing import Optional, Any, Dict


class SAAMEKException(Exception):
    """Base exception for all SAAMEK backend errors."""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}


class IngestionException(SAAMEKException):
    """Base exception for environmental telemetry ingestion errors."""
    pass


class InvalidApiKeyError(IngestionException):
    """Raised when an external API key is missing, unauthorized, or invalid."""
    pass


class ApiTimeoutError(IngestionException):
    """Raised when an external environmental API times out."""
    pass


class ExternalApiError(IngestionException):
    """Raised when an external environmental API returns an HTTP error or malformed payload."""

    def __init__(self, message: str, status_code: Optional[int] = None, response_text: Optional[str] = None):
        super().__init__(message, {"status_code": status_code, "response_text": response_text})
        self.status_code = status_code
        self.response_text = response_text


class CityNotFoundError(SAAMEKException):
    """Raised when a requested city is not found in the database."""
    pass
