"""OpenAQ API v3 Integration Client for Ambient Air Quality Telemetry."""
from typing import List, Dict, Any, Optional
import httpx

from app.core.config import settings
from app.core.logging import logger
from app.core.exceptions import InvalidApiKeyError, ApiTimeoutError, ExternalApiError


class OpenAQClient:
    """Client for querying the OpenAQ v3 REST API."""

    BASE_URL = "https://api.openaq.org/v3"

    def __init__(self, api_key: Optional[str] = None, timeout_seconds: float = 15.0):
        if api_key is not None:
            self.api_key = api_key.strip()
        else:
            self.api_key = (settings.OPENAQ_API_KEY or "").strip()
        self.timeout_seconds = timeout_seconds

    def _get_headers(self) -> Dict[str, str]:
        headers = {
            "Accept": "application/json",
            "User-Agent": "SAAMEK-Environmental-Platform/2.0",
        }
        if self.api_key:
            headers["X-API-Key"] = self.api_key
        return headers

    def _check_key_configured(self) -> None:
        if not self.api_key:
            raise InvalidApiKeyError(
                "OpenAQ API key is not configured. Set OPENAQ_API_KEY in the environment."
            )
        # Diagnostic check for accidentally provided OpenAI keys
        if self.api_key.startswith("sk-proj-") or self.api_key.startswith("sk-"):
            raise InvalidApiKeyError(
                "The configured OPENAQ_API_KEY appears to be an OpenAI key format (sk-...), "
                "not a valid OpenAQ API key from explore.openaq.org."
            )

    def get_locations_by_bbox(
        self,
        min_lon: float,
        min_lat: float,
        max_lon: float,
        max_lat: float,
        limit: int = 100,
    ) -> List[Dict[str, Any]]:
        """Discovers monitoring locations inside the specified geographic bounding box."""
        self._check_key_configured()

        bbox_str = f"{min_lon},{min_lat},{max_lon},{max_lat}"
        url = f"{self.BASE_URL}/locations"
        params = {"bbox": bbox_str, "limit": limit}

        try:
            with httpx.Client(timeout=self.timeout_seconds) as client:
                logger.info(f"Querying OpenAQ locations with bbox: {bbox_str}")
                response = client.get(url, params=params, headers=self._get_headers())

                if response.status_code in (401, 403):
                    raise InvalidApiKeyError(
                        f"OpenAQ Authentication failed (HTTP {response.status_code}): {response.text}"
                    )
                elif response.status_code >= 400:
                    raise ExternalApiError(
                        f"OpenAQ locations API error (HTTP {response.status_code}): {response.text}",
                        status_code=response.status_code,
                        response_text=response.text,
                    )

                data = response.json()
                results = data.get("results", [])
                logger.info(f"OpenAQ returned {len(results)} location(s) in bbox.")
                return results

        except httpx.TimeoutException as e:
            logger.error(f"OpenAQ locations request timed out: {e}")
            raise ApiTimeoutError(f"OpenAQ API request timed out after {self.timeout_seconds}s")
        except (InvalidApiKeyError, ExternalApiError, ApiTimeoutError):
            raise
        except Exception as e:
            logger.error(f"Unexpected error calling OpenAQ locations API: {e}")
            raise ExternalApiError(f"OpenAQ API communication failure: {str(e)}")

    def get_location_sensors(self, location_id: int | str) -> List[Dict[str, Any]]:
        """Fetches active monitoring sensors for a specific OpenAQ location."""
        self._check_key_configured()

        url = f"{self.BASE_URL}/locations/{location_id}/sensors"

        try:
            with httpx.Client(timeout=self.timeout_seconds) as client:
                response = client.get(url, headers=self._get_headers())

                if response.status_code in (401, 403):
                    raise InvalidApiKeyError(
                        f"OpenAQ Authentication failed (HTTP {response.status_code}): {response.text}"
                    )
                elif response.status_code >= 400:
                    raise ExternalApiError(
                        f"OpenAQ sensors API error for location {location_id} (HTTP {response.status_code})",
                        status_code=response.status_code,
                        response_text=response.text,
                    )

                data = response.json()
                return data.get("results", [])

        except httpx.TimeoutException:
            raise ApiTimeoutError(f"OpenAQ sensors request timed out for location {location_id}")
        except (InvalidApiKeyError, ExternalApiError, ApiTimeoutError):
            raise
        except Exception as e:
            raise ExternalApiError(f"OpenAQ sensor retrieval failure: {str(e)}")

    def get_location_latest(self, location_id: int | str) -> List[Dict[str, Any]]:
        """Fetches the latest air quality measurements for a specific OpenAQ location."""
        self._check_key_configured()

        url = f"{self.BASE_URL}/locations/{location_id}/latest"

        try:
            with httpx.Client(timeout=self.timeout_seconds) as client:
                response = client.get(url, headers=self._get_headers())

                if response.status_code in (401, 403):
                    raise InvalidApiKeyError(
                        f"OpenAQ Authentication failed (HTTP {response.status_code}): {response.text}"
                    )
                elif response.status_code >= 400:
                    raise ExternalApiError(
                        f"OpenAQ latest measurements error for location {location_id} (HTTP {response.status_code})",
                        status_code=response.status_code,
                        response_text=response.text,
                    )

                data = response.json()
                return data.get("results", [])

        except httpx.TimeoutException:
            raise ApiTimeoutError(f"OpenAQ latest measurements timed out for location {location_id}")
        except (InvalidApiKeyError, ExternalApiError, ApiTimeoutError):
            raise
        except Exception as e:
            raise ExternalApiError(f"OpenAQ measurement retrieval failure: {str(e)}")
