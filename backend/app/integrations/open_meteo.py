"""Open-Meteo Meteorological Telemetry Integration Client."""
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import httpx

from app.core.logging import logger
from app.core.exceptions import ApiTimeoutError, ExternalApiError


class OpenMeteoClient:
    """Client for retrieving meteorological telemetry from Open-Meteo."""

    BASE_URL = "https://api.open-meteo.com/v1/forecast"

    def __init__(self, timeout_seconds: float = 15.0):
        self.timeout_seconds = timeout_seconds

    def get_current_weather(self, latitude: float, longitude: float) -> Dict[str, Any]:
        """Fetches current surface meteorological parameters for given coordinates."""
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": "temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,weather_code",
            "timezone": "UTC",
        }

        try:
            with httpx.Client(timeout=self.timeout_seconds) as client:
                logger.info(f"Querying Open-Meteo for coordinates: [{latitude}, {longitude}]")
                response = client.get(self.BASE_URL, params=params)

                if response.status_code >= 400:
                    raise ExternalApiError(
                        f"Open-Meteo API returned error (HTTP {response.status_code}): {response.text}",
                        status_code=response.status_code,
                        response_text=response.text,
                    )

                data = response.json()
                current = data.get("current", {})

                # Parse observed_at datetime
                time_str = current.get("time")
                if time_str:
                    try:
                        observed_at = datetime.fromisoformat(time_str).replace(tzinfo=timezone.utc)
                    except Exception:
                        observed_at = datetime.now(timezone.utc)
                else:
                    observed_at = datetime.now(timezone.utc)

                normalized = {
                    "temperature": current.get("temperature_2m"),
                    "humidity": current.get("relative_humidity_2m"),
                    "pressure": current.get("surface_pressure"),
                    "wind_speed": current.get("wind_speed_10m"),
                    "wind_direction": current.get("wind_direction_10m"),
                    "weather_code": current.get("weather_code"),
                    "observed_at": observed_at,
                    "source": "Open-Meteo",
                    "raw_data": data,
                }

                logger.info(
                    f"Open-Meteo returned: Temp={normalized['temperature']}°C, "
                    f"Wind={normalized['wind_speed']} km/h @ {normalized['wind_direction']}°"
                )
                return normalized

        except httpx.TimeoutException as e:
            logger.error(f"Open-Meteo request timed out: {e}")
            raise ApiTimeoutError(f"Open-Meteo API request timed out after {self.timeout_seconds}s")
        except ExternalApiError:
            raise
        except Exception as e:
            logger.error(f"Unexpected error calling Open-Meteo API: {e}")
            raise ExternalApiError(f"Open-Meteo communication failure: {str(e)}")
