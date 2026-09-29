import math
from typing import Dict, Any


def point_from_coords(latitude: float, longitude: float) -> str:
    """Returns WKT string for spatial POINT."""
    return f"SRID=4326;POINT({longitude} {latitude})"


def is_in_bounding_box(bbox: Dict[str, float], latitude: float, longitude: float) -> bool:
    """Checks if coordinates fall within city bounding box."""
    return (
        bbox.get("min_lat", -90) <= latitude <= bbox.get("max_lat", 90)
        and bbox.get("min_lon", -180) <= longitude <= bbox.get("max_lon", 180)
    )


def calculate_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two geographic coordinates in kilometers."""
    R = 6371.0  # Earth's radius in km
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c
