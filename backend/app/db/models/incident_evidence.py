from datetime import datetime
from typing import Optional
from sqlalchemy import Integer, String, Boolean, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class IncidentEvidence(Base):
    __tablename__ = "incident_evidence"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    incident_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False, index=True
    )
    evidence_type: Mapped[str] = mapped_column(
        String(100), nullable=False
    )  # aq_spike, wind_trajectory, satellite_thermal, citizen_report, sensor_threshold, visual_report
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    value_text: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_supporting: Mapped[bool] = mapped_column(Boolean, default=True)  # True = supporting evidence (✓), False = absent/counter (✗)
    source: Mapped[str] = mapped_column(String(100), nullable=False, default="OpenAQ")
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    incident: Mapped["Incident"] = relationship("Incident", back_populates="evidence_items")

    def __repr__(self) -> str:
        return f"<IncidentEvidence id={self.id} incident_id={self.incident_id} type='{self.evidence_type}' supporting={self.is_supporting}>"
