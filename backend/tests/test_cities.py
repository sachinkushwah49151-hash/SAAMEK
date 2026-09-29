def test_get_cities(client):
    """Verify GET /api/cities returns active cities including Gwalior."""
    response = client.get("/api/cities")
    assert response.status_code == 200
    cities = response.json()
    assert isinstance(cities, list)
    assert len(cities) >= 1
    gwalior = next((c for c in cities if c["name"] == "Gwalior"), None)
    assert gwalior is not None
    assert gwalior["state"] == "Madhya Pradesh"
    assert gwalior["country"] == "India"
    assert gwalior["latitude"] == 26.2183
    assert gwalior["longitude"] == 78.1828
    assert "bounding_box" in gwalior
    assert gwalior["bounding_box"]["min_lon"] == 78.05


def test_get_gwalior_city(client):
    """Verify GET /api/cities/gwalior returns exact Gwalior pilot configuration."""
    response = client.get("/api/cities/gwalior")
    assert response.status_code == 200
    city = response.json()
    assert city["name"] == "Gwalior"
    assert city["state"] == "Madhya Pradesh"
    assert city["country"] == "India"
    assert city["latitude"] == 26.2183
    assert city["longitude"] == 78.1828
    assert city["is_active"] is True
    assert "min_lat" in city["bounding_box"]


def test_get_nonexistent_city(client):
    """Verify requesting an unregistered city returns 404."""
    response = client.get("/api/cities/UnknownCity12345")
    assert response.status_code == 404
