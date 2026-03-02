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
    email:       EmailStr         
    department:  str
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
        from_attributes = True  


# ─── Attendance ───────

class AttendanceCreate(BaseModel):
    employee_id: str
    date:        date
    status:      Literal["Present", "Absent"]  


class AttendanceOut(BaseModel):
    id:          int
    employee_id: str
    date:        date
    status:      str

    class Config:
        from_attributes = True
