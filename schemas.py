from pydantic import BaseModel, EmailStr, field_validator, StringConstraints
from typing import Optional, Annotated

import re

class PasswordValidator(BaseModel):
    password: Annotated[str, StringConstraints(min_length=8)]

    @field_validator("password")
    def validate_password_strength(cls, v):
        if not re.search(r"[A-Z]",v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]",v):
            raise ValueError("Password must contain at least one lowercase letter") 
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v

class emp_schema(PasswordValidator):
    emp_id: int
    name: str
    dept: str
    email: EmailStr

    @field_validator("name")
    def validate_name(cls, v):
        if not re.search(r"^[A-Za-z\s]+$", v):
            raise ValueError("Name must contain only letters and spaces")
        return v
    
    @field_validator("dept")
    def validate_dept(cls, v):
        if not re.match(r"^[A-Za-z\s]+$", v):
            raise ValueError("Department must contain only letters and spaces")
        return v
    

class emp_resopnse(BaseModel):
    name : str
    dept : str
    email : str

    # class config:
    #     orm_mode = True

        
class ResetPasswordRequest(BaseModel):
    email: EmailStr
    current_password: str
    new_password: Annotated[str, StringConstraints(min_length=8)]

    @field_validator("new_password")
    def validate_password_strength(cls, v):
        return PasswordValidator(password=v).password
    

class emp_patch_schema(BaseModel):
    name: Optional[str] = None
    dept: Optional[str] = None
    email: Optional[EmailStr] = None
    # password: Optional [Annotated[str, StringConstraints(min_length=8)]] = None 

    @field_validator("name")
    def validate_name(cls, v):
        if not re.match(r"^[A-Za-z\s]+$", v):
            raise ValueError("Name must contain only letters and spaces")
        return v

    @field_validator("dept")
    def validate_dept(cls, v):
        if not re.match(r"^[A-Za-z\s]+$", v):
            raise ValueError("Department must contain only letters and spaces")
        return v

    # @field_validator("password")
    # def validate_password_strength(cls, v):
    #     return PasswordValidator(password=v).password

class emp_put_schema(BaseModel):
    name : str
    dept : str
    email : EmailStr

    @field_validator("name")
    def validate_name(cls,v):
        if not re.match(r"^[A-Za-z\s]+$", v):
            raise ValueError("Name must contain only letters and spaces")
        return v
    
    @field_validator("dept")
    def validate_dept(cls, v):
        if not re.match(r"^[A-Za-z\s]+$", v):
            raise ValueError("Name must contain only letters and spaces")
        return v


class emp_delete_schema(BaseModel):
    email : str
    password : str

# --- JWT additions ---

class Token(BaseModel):
    access_token : str
    token_type : str


    