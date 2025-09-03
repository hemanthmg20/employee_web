from fastapi import FastAPI,Depends,HTTPException
# from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from models import empData
from database import Base,sessionLocal,engine
from schemas import emp_schema, emp_resopnse, ResetPasswordRequest, emp_patch_schema, emp_put_schema, emp_delete_schema
from auth import hash_password, verify_password

from fastapi.security import OAuth2PasswordBearer,OAuth2PasswordRequestForm
from schemas import Token
from auth import create_access_token, decode_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta
from jose import JWTError

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

def get_db():
    db = sessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- OAuth2 Bearer setup ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl='token')

def get_current_user(token : str = Depends(oauth2_scheme), db : Session = Depends(get_db)):
    credential_exception = HTTPException(status_code=401,detail="Could not validate credentials",headers={"WWW-Authenticate": "Bearer"},)

    try:
        payload = decode_access_token(token)
        email : str = payload.get('sub')
        if email is None:
            raise credential_exception
    except JWTError:
        raise credential_exception

    user = db.query(empData).filter(empData.email == email).first()

    if user is None:
        raise credential_exception
    return user

@app.post('/token', response_model=Token, tags=['Auth'], include_in_schema = False)
def login_for_access_token(form_data : OAuth2PasswordRequestForm = Depends(), db : Session = Depends(get_db)):
    user = db.query(empData).filter(empData.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token = create_access_token(
        data={'sub': user.email},expire_time = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}




@app.post('/emp', response_model=emp_resopnse, tags=["Employees"])
def create_emp(request: emp_schema, db: Session = Depends(get_db)):
    try:
        hashed_password = hash_password(request.password)
        new_emp = empData(
            emp_id=request.emp_id,
            name=request.name,
            dept=request.dept,
            email=request.email,
            password=hashed_password
        )
        db.add(new_emp)
        db.commit()
        db.refresh(new_emp)
        return new_emp
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@app.get('/emp', response_model=list[emp_resopnse], tags=["Employees"])
def get_employees(db: Session = Depends(get_db), current_user: empData = Depends(get_current_user)):
    try:
        emps = db.query(empData).all()
        if not emps:
            raise HTTPException(status_code=404, detail="No employees were found")
        return emps
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@app.get('/emp/{id}', response_model=emp_resopnse, tags=["Employees"])
def get_emp(id: int, db: Session = Depends(get_db), current_user: empData = Depends(get_current_user)):
    try:
        emp = db.query(empData).filter(empData.emp_id == id).first()
        if not emp:
            raise HTTPException(status_code=404, detail=f"No employee found with the empid {id}")
        return emp
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@app.put("/emp/reset/{id}", tags=['Employees'])
def update_passkey(id: int, request: ResetPasswordRequest, db: Session = Depends(get_db), current_user: empData = Depends(get_current_user)):
    try:
        emp_data = db.query(empData).filter(empData.emp_id == id).first()
        if not emp_data:
            raise HTTPException(status_code=404, detail=f"Employee details with id {id} not found")

        if emp_data.email != request.email or not verify_password(request.current_password, emp_data.password):
            raise HTTPException(status_code=400, detail="Email or current password does not match")

        if verify_password(request.new_password, emp_data.password):
            raise HTTPException(status_code=400, detail="New password cannot be the same as the old password")

        emp_data.password = hash_password(request.new_password)
        db.commit()
        db.refresh(emp_data)
        return {"detail": "Password reset successful!"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@app.put('/emp/{id}', response_model=emp_resopnse, tags=["Employees"])
def update_emp(id: int, request: emp_put_schema, db: Session = Depends(get_db), current_user: empData = Depends(get_current_user)):
    try:
        emp = db.query(empData).filter(empData.emp_id == id).first()
        if not emp:
            raise HTTPException(status_code=404, detail=f"Employee with id {id} not found")

        emp.name = request.name
        emp.dept = request.dept
        emp.email = request.email

        db.commit()
        db.refresh(emp)
        return emp
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@app.patch('/emp/{id}', response_model=emp_resopnse, tags=["Employees"])
def patch_emp(id: int, request: emp_patch_schema, db: Session = Depends(get_db), current_user: empData = Depends(get_current_user)):
    try:
        emp = db.query(empData).filter(empData.emp_id == id).first()
        if not emp:
            raise HTTPException(status_code=404, detail=f"Employee with id {id} not found")

        update_data = request.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(emp, key, value)

        db.commit()
        db.refresh(emp)
        return emp
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@app.delete('/emp/{id}', tags=["Employees"])
def delete_emp(id: int, request: emp_delete_schema, db: Session = Depends(get_db), current_user: empData = Depends(get_current_user)):
    try:
        emp = db.query(empData).filter(empData.emp_id == id).first()
        if not emp:
            raise HTTPException(status_code=404, detail=f"Employee details with id {id} not found")

        if emp.email != request.email or not verify_password(request.password, emp.password):
            raise HTTPException(status_code=400, detail="Email or current password does not match")

        db.delete(emp)
        db.commit()
        return {"detail": "Employee deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@app.post('/emp/verify', tags=["Authenticate user"], include_in_schema=False)
def verify_emp(request: emp_schema, db: Session = Depends(get_db), current_user: empData = Depends(get_current_user)):
    try:
        emp = db.query(empData).filter(empData.emp_id == request.emp_id).first()
        if not emp:
            raise HTTPException(status_code=404, detail=f"Employee with id {request.emp_id} not found")

        if emp.email == request.email and verify_password(request.password, emp.password):
            return {"data": "Validation successful"}
        else:
            return {"data": "Check your credentials again"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
