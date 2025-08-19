# models/workout_session.py
# models/workout_session.py

import uuid
from datetime import datetime, timedelta
from extensions import db
from sqlalchemy.dialects.postgresql import UUID


class WorkoutSession(db.Model):
    __tablename__ = 'workout_sessions'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # 👇 Cascade delete at the DB level
    user_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey('users.id', ondelete="CASCADE"),
        nullable=False
    )

    # High-level category and specific exercise
    workout_type   = db.Column(db.String(100))   # e.g., Strength, Cardio, Yoga
    exercise_name  = db.Column(db.String(100))   # e.g., Deadlift, Bench Press

    # Optional performance details
    sets           = db.Column(db.Integer)       # total working sets
    reps           = db.Column(db.Integer)       # reps of top/avg set
    weight_lbs     = db.Column(db.Float)         # weight for top/avg set

    # Source of the session relative to plan
    source         = db.Column(db.String(12))    # 'planned' or 'extra'

    # Duration / calories
    duration_minutes = db.Column(db.Integer)     # time spent working out
    calories_burned  = db.Column(db.Float)       # optional

    # Core timestamp for the workout (stored in UTC ideally)
    workout_date = db.Column(db.DateTime, default=datetime.utcnow)

    # Pre-computed fields for easier charting
    day_of_week = db.Column(db.String(3))        # e.g., Mon, Tue, Wed
    week_start  = db.Column(db.Date)             # Monday's date for weekly aggregation
    month       = db.Column(db.String(7))        # e.g., 2025-08
    year        = db.Column(db.Integer)          # e.g., 2025
    hour_of_day = db.Column(db.Integer)          # 0-23 (for hourly patterns)

    # Relationship is now managed from User side (with cascade)
    user = db.relationship("User", backref=db.backref(
        "workout_sessions",
        cascade="all, delete-orphan"
    ))

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if self.workout_date:
            # Ensure charting fields are derived from workout_date
            self.day_of_week = self.workout_date.strftime("%a")
            self.week_start  = self.workout_date.date() - timedelta(days=self.workout_date.weekday())
            self.month       = self.workout_date.strftime("%Y-%m")
            self.year        = self.workout_date.year
            self.hour_of_day = self.workout_date.hour




"""""""""""
import uuid
from datetime import datetime, timedelta
from extensions import db
from sqlalchemy.dialects.postgresql import UUID


class WorkoutSession(db.Model):
    __tablename__ = 'workout_sessions'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)

    # High-level category and specific exercise
    workout_type   = db.Column(db.String(100))   # e.g., Strength, Cardio, Yoga
    exercise_name  = db.Column(db.String(100))   # e.g., Deadlift, Bench Press (NEW)

    # Optional performance details
    sets           = db.Column(db.Integer)       # total working sets (NEW)
    reps           = db.Column(db.Integer)       # reps of top/avg set (NEW)
    weight_lbs     = db.Column(db.Float)         # weight for top/avg set (NEW)

    # Source of the session relative to plan
    source         = db.Column(db.String(12))    # 'planned' or 'extra' (NEW)

    # Duration / calories
    duration_minutes = db.Column(db.Integer)     # time spent working out
    calories_burned  = db.Column(db.Float)       # optional

    # Core timestamp for the workout (stored in UTC ideally)
    workout_date = db.Column(db.DateTime, default=datetime.utcnow)

    # Pre-computed fields for easier charting
    day_of_week = db.Column(db.String(3))        # e.g., Mon, Tue, Wed
    week_start  = db.Column(db.Date)             # Monday's date for weekly aggregation
    month       = db.Column(db.String(7))        # e.g., 2025-08
    year        = db.Column(db.Integer)          # e.g., 2025
    hour_of_day = db.Column(db.Integer)          # 0-23 (for hourly patterns)

    user = db.relationship("User", backref="workout_sessions")

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if self.workout_date:
            # Ensure charting fields are derived from workout_date
            self.day_of_week = self.workout_date.strftime("%a")
            self.week_start  = self.workout_date.date() - timedelta(days=self.workout_date.weekday())
            self.month       = self.workout_date.strftime("%Y-%m")
            self.year        = self.workout_date.year
            self.hour_of_day = self.workout_date.hour
            

"""