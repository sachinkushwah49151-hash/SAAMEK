from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.db.models.city import City
from app.schemas.city import CityCreate


class CityRepository:
    @staticmethod
    def get_active_cities(db: Session) -> List[City]:
        stmt = select(City).where(City.is_active.is_(True)).order_by(City.name)
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def get_city_by_name(db: Session, name: str) -> Optional[City]:
        stmt = select(City).where(City.name.ilike(name))
        return db.execute(stmt).scalars().first()

    @staticmethod
    def get_city_by_id(db: Session, city_id: int) -> Optional[City]:
        stmt = select(City).where(City.id == city_id)
        return db.execute(stmt).scalars().first()

    @staticmethod
    def create_city(db: Session, city_in: CityCreate) -> City:
        city = City(
            name=city_in.name,
            state=city_in.state,
            country=city_in.country,
            latitude=city_in.latitude,
            longitude=city_in.longitude,
            bounding_box=city_in.bounding_box,
            is_active=city_in.is_active,
        )
        db.add(city)
        db.commit()
        db.refresh(city)
        return city
