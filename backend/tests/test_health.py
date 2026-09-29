def test_health_endpoint(client):
    """Verify GET /api/health returns status ok."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data == {"status": "ok"}


def test_health_details_endpoint(client):
    """Verify GET /api/health/details reports database connection."""
    response = client.get("/api/health/details")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database_connected"] is True


def test_root_endpoint(client):
    """Verify application root endpoint responds with metadata."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert "health_endpoint" in data
