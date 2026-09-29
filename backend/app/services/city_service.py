from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.db.models.city import City
from app.repositories.city_repository import CityRepository


class CityService:
    def __init__(self, repo: CityRepository = CityRepository()):
        self.repo = repo

    def get_active_cities(self, db: Session) -> List[City]:
        return self.repo.get_active_cities(db)

    def get_city_by_name(self, db: Session, name: str) -> City:
        city = self.repo.get_city_by_name(db, name)
        if not city:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"City '{name}' not found or inactive in the monitoring network.",
            )
        return city

    def get_gwalior(self, db: Session) -> City:
        return self.get_city_by_name(db, "Gwalior")


city_service = CityService()
