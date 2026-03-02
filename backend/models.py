"""
models.py – SQLAlchemy ORM models.

Think of each class here as a DATABASE TABLE.
Each attribute = a column in that table.
"""

from sqlalchemy import Column, String, Date, Enum, Integer, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Employee(Base):
    __tablename__ = "employees"  # This is the actual table name in SQLite/Postgres

    # Primary key – we use employee_id string like "EMP001" as the PK
    employee_id = Column(String, primary_key=True, index=True)
    full_name   = Column(String, nullable=False)
    email       = Column(String, unique=True, nullable=False, index=True)
    department  = Column(String, nullable=False)

    # One employee → many attendance records
    # cascade="all, delete-orphan" means: deleting employee also deletes their attendance
    attendance  = relationship("Attendance", back_populates="employee", cascade="all, delete-orphan")


class Attendance(Base):
    __tablename__ = "attendance"

    id          = Column(Integer, primary_key=True, autoincrement=True)
    employee_id = Column(String, ForeignKey("employees.employee_id"), nullable=False)
    date        = Column(Date, nullable=False)
    status      = Column(Enum("Present", "Absent", name="attendance_status"), nullable=False)

    # Back-reference to employee
    employee    = relationship("Employee", back_populates="attendance")
