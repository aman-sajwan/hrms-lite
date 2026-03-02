"""
schemas.py – Pydantic models (request/response validation).

"""

from pydantic import BaseModel, EmailStr, field_validator
from datetime import date
from typing import Literal


# ─── Employee ────

class EmployeeCreate(BaseModel):
    employee_id: str
    full_name:   str
    email:       EmailStr          # Pydantic auto-validates email format!
    department:  str

    # Custom validator: strip whitespace, ensure non-empty
    @field_validator("employee_id", "full_name", "department")
    @classmethod
    def must_not_be_blank(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Field cannot be blank.")
        return v.strip()


class EmployeeOut(BaseModel):
    employee_id: str
    full_name:   str
    email:       str
    department:  str

    class Config:
        from_attributes = True   # Tells Pydantic to read from SQLAlchemy model attributes


# ─── Attendance ───────

class AttendanceCreate(BaseModel):
    employee_id: str
    date:        date
    status:      Literal["Present", "Absent"]  # Only these two values allowed


class AttendanceOut(BaseModel):
    id:          int
    employee_id: str
    date:        date
    status:      str

    class Config:
        from_attributes = True
