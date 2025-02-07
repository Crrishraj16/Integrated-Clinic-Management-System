from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.notification import Notification, NotificationPreference
from app.schemas.notification import (
    NotificationCreate,
    NotificationResponse,
    NotificationPreferenceUpdate,
    NotificationPreferenceResponse
)
from app.auth.auth import get_current_user

router = APIRouter()

@router.get("/user/{user_id}", response_model=List[NotificationResponse])
def get_user_notifications(
    user_id: int,
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    skip = (page - 1) * limit
    notifications = db.query(Notification)\
        .filter(Notification.user_id == user_id)\
        .order_by(Notification.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    return notifications

@router.post("/", response_model=NotificationResponse)
def create_notification(
    notification: NotificationCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_notification = Notification(**notification.dict())
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

@router.put("/{notification_id}/read")
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.status = "READ"
    notification.updated_at = datetime.utcnow()
    db.commit()
    return {"status": "success"}

@router.get("/preferences/{user_id}", response_model=NotificationPreferenceResponse)
def get_notification_preferences(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    preferences = db.query(NotificationPreference)\
        .filter(NotificationPreference.user_id == user_id)\
        .first()
    if not preferences:
        preferences = NotificationPreference(user_id=user_id)
        db.add(preferences)
        db.commit()
        db.refresh(preferences)
    return preferences

@router.put("/preferences/{user_id}", response_model=NotificationPreferenceResponse)
def update_notification_preferences(
    user_id: int,
    preferences: NotificationPreferenceUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_preferences = db.query(NotificationPreference)\
        .filter(NotificationPreference.user_id == user_id)\
        .first()
    if not db_preferences:
        db_preferences = NotificationPreference(user_id=user_id)
        db.add(db_preferences)
    
    for key, value in preferences.dict(exclude_unset=True).items():
        setattr(db_preferences, key, value)
    
    db.commit()
    db.refresh(db_preferences)
    return db_preferences
