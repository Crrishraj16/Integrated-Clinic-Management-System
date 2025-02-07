from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.medication import Medication, MedicationReminder
from app.schemas.medication import (
    MedicationCreate,
    MedicationUpdate,
    MedicationResponse,
    ReminderCreate,
    ReminderResponse
)
from app.auth.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=MedicationResponse)
def create_medication(
    medication: MedicationCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_medication = Medication(**medication.dict())
    db.add(db_medication)
    db.commit()
    db.refresh(db_medication)
    return db_medication

@router.get("/patient/{patient_id}", response_model=List[MedicationResponse])
def get_patient_medications(
    patient_id: int,
    active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(Medication).filter(Medication.patient_id == patient_id)
    if active is not None:
        query = query.filter(Medication.active == active)
    return query.all()

@router.put("/{medication_id}", response_model=MedicationResponse)
def update_medication(
    medication_id: int,
    medication: MedicationUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_medication = db.query(Medication).filter(Medication.id == medication_id).first()
    if not db_medication:
        raise HTTPException(status_code=404, detail="Medication not found")
    
    for key, value in medication.dict(exclude_unset=True).items():
        setattr(db_medication, key, value)
    
    db.commit()
    db.refresh(db_medication)
    return db_medication

@router.post("/{medication_id}/reminders", response_model=ReminderResponse)
def create_reminder(
    medication_id: int,
    reminder: ReminderCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    medication = db.query(Medication).filter(Medication.id == medication_id).first()
    if not medication:
        raise HTTPException(status_code=404, detail="Medication not found")
    
    db_reminder = MedicationReminder(
        medication_id=medication_id,
        patient_id=medication.patient_id,
        **reminder.dict()
    )
    db.add(db_reminder)
    db.commit()
    db.refresh(db_reminder)
    return db_reminder

@router.put("/reminders/{reminder_id}/acknowledge")
def acknowledge_reminder(
    reminder_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    reminder = db.query(MedicationReminder).filter(MedicationReminder.id == reminder_id).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    reminder.status = "ACKNOWLEDGED"
    reminder.updated_at = datetime.utcnow()
    db.commit()
    return {"status": "success"}
