from sqlalchemy import Column,String,Integer
from database import Base

class empData(Base):
    __tablename__ = 'employeedata'
    emp_id = Column(Integer,primary_key=True,index=True)
    name = Column(String(255),index=True)
    dept = Column(String(255),index=True)
    email = Column(String(255), index=True)
    password = Column(String(255), index=True)

    