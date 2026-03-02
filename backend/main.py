from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
import models, schemas, database

app = FastAPI(title="HRMS Lite API", version="1.0.0")

# ─── CORS ─────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  
        "https://hrms-lite-demo-eight.vercel.app" 
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── DB Init ────
models.Base.metadata.create_all(bind=database.engine)

# ─── Dependency ──
def get_db():
    """Creates a DB session per request, then closes it when done."""
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

 # ═════════════#  EMPLOYEE ROUTES # ═══════════════

@app.get("/employees", response_model=List[schemas.EmployeeOut])
def get_all_employees(db: Session = Depends(get_db)):
    """Return all employees."""
    return db.query(models.Employee).all()


@app.post("/employees", response_model=schemas.EmployeeOut, status_code=201)
def create_employee(emp: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    """Add a new employee. Validates duplicates on ID and email."""
    # Check duplicate employee_id
    if db.query(models.Employee).filter(models.Employee.employee_id == emp.employee_id).first():
        raise HTTPException(status_code=400, detail="Employee ID already exists.")
    # Check duplicate email
    if db.query(models.Employee).filter(models.Employee.email == emp.email).first():
        raise HTTPException(status_code=400, detail="Email already registered.")

    new_emp = models.Employee(**emp.dict())
    db.add(new_emp)
    db.commit()
    db.refresh(new_emp)
    return new_emp


@app.delete("/employees/{employee_id}", status_code=200)
def delete_employee(employee_id: str, db: Session = Depends(get_db)):
    """Delete an employee and their attendance records."""
    emp = db.query(models.Employee).filter(models.Employee.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found.")
    db.delete(emp)
    db.commit()
    return {"message": f"Employee {employee_id} deleted successfully."}


# ════════════  ATTENDANCE ROUTES  # ════════════

@app.get("/attendance", response_model=List[schemas.AttendanceOut])
def get_all_attendance(
    employee_id: Optional[str] = None,
    date_filter: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Get attendance. Optionally filter by employee_id or date."""
    query = db.query(models.Attendance)
    if employee_id:
        query = query.filter(models.Attendance.employee_id == employee_id)
    if date_filter:
        query = query.filter(models.Attendance.date == date_filter)
    return query.order_by(models.Attendance.date.desc()).all()


@app.post("/attendance", response_model=schemas.AttendanceOut, status_code=201)
def mark_attendance(att: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    """Mark attendance for an employee on a given date."""
    # Make sure the employee exists
    emp = db.query(models.Employee).filter(models.Employee.employee_id == att.employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found.")

    # Prevent duplicate attendance on the same day
    existing = db.query(models.Attendance).filter(
        models.Attendance.employee_id == att.employee_id,
        models.Attendance.date == att.date
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Attendance already marked for this date.")

    new_att = models.Attendance(**att.dict())
    db.add(new_att)
    db.commit()
    db.refresh(new_att)
    return new_att


@app.delete("/attendance/{attendance_id}", status_code=200)
def delete_attendance(attendance_id: int, db: Session = Depends(get_db)):
    """Delete a specific attendance record."""
    att = db.query(models.Attendance).filter(models.Attendance.id == attendance_id).first()
    if not att:
        raise HTTPException(status_code=404, detail="Attendance record not found.")
    db.delete(att)
    db.commit()
    return {"message": "Attendance record deleted."}


# ─── Dashboard Summary ───

@app.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    """Returns summary counts for the dashboard."""
    total_employees = db.query(models.Employee).count()
    total_present_today = db.query(models.Attendance).filter(
        models.Attendance.date == date.today(),
        models.Attendance.status == "Present"
    ).count()
    total_absent_today = db.query(models.Attendance).filter(
        models.Attendance.date == date.today(),
        models.Attendance.status == "Absent"
    ).count()
    total_attendance_records = db.query(models.Attendance).count()

    # Per-employee present days count
    employees = db.query(models.Employee).all()
    employee_stats = []
    for emp in employees:
        present_days = db.query(models.Attendance).filter(
            models.Attendance.employee_id == emp.employee_id,
            models.Attendance.status == "Present"
        ).count()
        employee_stats.append({
            "employee_id": emp.employee_id,
            "name": emp.full_name,
            "department": emp.department,
            "present_days": present_days
        })

    return {
        "total_employees": total_employees,
        "present_today": total_present_today,
        "absent_today": total_absent_today,
        "total_attendance_records": total_attendance_records,
        "employee_stats": employee_stats
    }


@app.get("/")
def root():
    return {"message": "HRMS Lite API is running 🚀"}
