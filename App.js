import { useState } from "react";
import './App.css';
import axios from 'axios';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



export default function App(){
  return(
    <>
    <h2 style={{display:"flex", justifyContent:"center"}}>EMPLOYEE CRUD OPERATIONS</h2>
    <div style={{display:"flex",marginTop:"45px", justifyContent:"space-between"}}>
    <Form />
    <Userlist />
    <Updatepasskey />
    <ToastContainer position="top-left" autoClose={3000} hideProgressBar={false} />
    </div>
    </>
  );
}


function Form(){

  // State to store the data from the form input fields 
  const [formData, setFormData] = useState(
    {
      emp_id:'',
      name:'',
      dept:'',
      email:'',
      password:'',
    }
  );

  // State to store error messages in the each fields
  const [errors, setErrors] = useState({})

  const regexRules = {
    emp_id : {regex : /^[0-9]+$/, msg : "Employee ID must contain only numbers" },
    name : {regex : /^[A-Za-z\s]{3,30}$/, msg : "Name must be 3–30 letters without digits and special charecters"},
    dept : {regex : /^[A-Za-z\s]{2,20}$/, msg : "Department must be 2-20 letters without digits and special charecters"},
    password : {regex: /^[A-Za-z0-9]{8,20}$/, msg : "Password must be 8–20 chars, with at least 1 uppercase,lowercase and a digit"}
  }

  // Handling input change
  const handleChange = (e) => {
    // [e.target.name] is a computed property syntax. JS will evaluate this expression and use its result as a key.
    // setFormData({...formData, [e.target.name] : e.target.value }); 

    // Destructuring the input field name and its value 
    const { name, value } = e.target;

    setFormData({...formData,[name] : value});

    // validating the input values
    if (regexRules[name] && !regexRules[name].regex.test(value)) {
      setErrors({ ...errors,[name] : regexRules[name].msg});
    }else{
      // Instead of modifing the object (errors) directly [react warns for direct modificaton] we create a copy, modify it and then assign through setErrors 
      const newerrors = {...errors}; // shallow copy 
      delete newerrors[name];
      // modify a copy (newErrors) 
      setErrors(newerrors);
    }

  };

  // Handling form submit
  const handleSubmit = async (e) => {
    // debugger
    e.preventDefault()
    // alert('form submitted');
    console.log(formData);

    try {
    const response = await axios.post('http://127.0.0.1:8000/emp', formData);
    console.log("Response from server :", response.data);
    
    toast.success(`Hello ${response.data.name}, data submitted successfully!`);
    setFormData({emp_id:'',name:'',dept:'',email:'',password:''});

    } catch (error) {
    console.error('error in form submission', error);
    toast.error('Failed to submit form');
    }

  }
  return(
    // <div style={{}}>
      <div style={{marginLeft:"50px", width:"200px"}}>
        <form onSubmit={handleSubmit}>
            <h2 style={{marginLeft:"12px"}}>Enter User Data</h2>

            <input
              type="text"
              placeholder="Emplyee ID"
              className="input-field"
              onChange={handleChange}
              name="emp_id"
              value={formData.emp_id}
              required
            />
            { errors.emp_id && <p style={{color:"red", fontSize:"12px"}}>{errors.emp_id}</p>}

            <input
              type="text"
              placeholder="Name"
              className="input-field"
              onChange={handleChange}
              name="name"
              value={formData.name}
              required
              />
              {errors.name && <p style={{color:"red", fontSize:"12px"}}>{errors.name}</p>}

            <input
            type="text"
            placeholder="Department"
            className="input-field"
            onChange={handleChange}
            name="dept"
            value={formData.dept}
            required
            />
            {errors.dept && <p style={{color:"red", fontSize:"12px"}}>{errors.dept}</p>}

            <br></br>
            <input
            type="email"
            placeholder="Email"
            className="input-field"
            onChange={handleChange}
            name="email"
            value={formData.email}
            required
            />

            <br></br>
            <input
            type="password"
            placeholder="password"
            className="input-field"
            onChange={handleChange}
            name="password"
            value={formData.password}
            required
            />
            {errors.password && <p style={{color:"red", fontSize:"12px"}}>{errors.password}</p>}

            <button
            type="submit"
            className="submit-btn"
          >
            Submit
          </button>
        </form>
      </div>
    // </div>
  );
}

function Userlist() {
  //  State to store the users data
  const [users, setUsers] = useState([]);

  // state to check if we have user in db
  const [errorResponse, seterrorResponse] = useState(false);

  // to store user being edited 
  const [editingUser, setEditingUser] = useState(null); 
  
// fetching user data
  const userData = async() => {
    seterrorResponse(false);
    try{
      const response = await axios.get("http://127.0.0.1:8000/emp");
      setUsers(response.data);
      console.log(response.data);
    }catch(error){
      if(error.response.status === 404){
        seterrorResponse(true);
        // alert("No employees were found");
      }
      else{
        alert('error fetching users data');
      }
    }
  }

  // deleting the user data
  const deleteUser = async (emp_id) => {
    try {
      // const id = parseInt(emp_id, 10);
      await axios.delete(`http://127.0.0.1:8000/emp/${emp_id}`);
      toast.success(`Employee with EmpID:${emp_id} deleted successfully`);

      //  By itterating through all the user data using filter function and removing the matching one.
             setUsers(users.filter((u) => u.emp_id !== emp_id));

    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  // setting editingUser (state object) from null to current user data upon clicking update button so that it conditionally render the update form in the UI
  const handleEditClick = (user) => {
    setEditingUser(user);
  }

  return (
    <div style={{ display:"flex", flexDirection:"column",alignItems:"center",width:"450px",marginTop:"15px" }}>

      {/* {users.length === 0 && <p>Please click <strong>Get Users</strong> to fetch data</p>} */}
      <p>Please click <strong>Get Users</strong> to fetch data</p>
      <button onClick={userData} className="get-users">
        Get Users
      </button>

      {errorResponse === true && 
        <p style={{color:"red"}}>No employees found!</p>
      }

      {users.length !== 0  && 
      (
        <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", marginTop: "20px" }}>
          <thead>
            <tr>
              <th>Emp ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Email</th>
              <th>Update</th>
              <th>Delete</th>
            </tr>
          </thead>
          
          <tbody>
              {
                users.map((user) => (
                  <UserComp key={user.emp_id} user={user} onDelete={deleteUser} onEdit={handleEditClick}/>
                ))
              }
          </tbody>
        </table>
      )}

      {/*----------- conditonally rendering the update form -------------  */}

      {editingUser && (
        <div style={{display:"flex", flexDirection:"column",alignItems:"center"}}>
          <br></br>
          <h3 style={{color:"gray"}}>Updating Employee with ID : {editingUser.emp_id}</h3>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try{
                const response = await axios.put(`http://127.0.0.1:8000/emp/${editingUser.emp_id}`,editingUser);
                console.log(response.status);
                toast.success('Employee data updated successfully');
              
              // Here we can use either of the below lines to get updated data to UI 

              // 1. updating the users state object by itterating through map function and update the matching one.
                     // setUsers(users.map((u) => u.emp_id === editingUser.emp_id ? editingUser : u));

              //  2. calling userData() to fetch the entire data from the database so that it reflect on the UI 
                      userData();

              // Closing the edit form by setting editingUser back to null
              setEditingUser(null);

              }catch(error){
                if(error.response.status === 401){
                  toast.error("Unauthorized access")
                }else{
                  toast.error('Falied to update user data')
                }
              }
            
            }}
          
          >
            <input 
              type="text"
              value={editingUser.name}
              onChange={(e) =>
                setEditingUser({...editingUser,name:e.target.value})
              }
              placeholder="Name"
              className="input-field"
              required
            /><br></br>

            <input 
              type="text"
              value={editingUser.dept}
              onChange={(e) =>
                setEditingUser({...editingUser,dept:e.target.value})
              }
              placeholder="Department"
              className="input-field"
              required
            /><br></br>

            <input
              type="email"
              value={editingUser.email}
              onChange={(e) =>
                setEditingUser({ ...editingUser, email: e.target.value })
              }
              placeholder="Email"
              className="input-field"
              required
            /><br></br>

            <button
             type="submit"
             className="submit-btn"
            >Update</button>
          </form>
        </div>
      )}
    </div>
  );
}

function UserComp({ user, onDelete, onEdit }) {
  return (
    <tr>
      <td>{user.emp_id}</td>
      <td>{user.name}</td>
      <td>{user.dept}</td>
      <td>{user.email}</td>
      <td>
        <button className="update-btn" onClick={() => onEdit(user)} >Update</button>
      </td>
      <td>
        <button className="delete-btn" onClick={() => onDelete(Number(user.emp_id))}>Delete</button>
      </td>
    </tr>
  );
}

function Updatepasskey() {
  // state to verify current password
  const [verifyPassword, setVerifypassword] = useState(
    {
      emp_id : "",
      email : "",
      password : ""
    }
  )

  // state to check the type of error
  const [error, setError] = useState("")

  // state to set newpassword
  const [newPasscode, setNewPasscode] = useState(
    {
      new_password : "",
      confirm_new_password : ""
    }
  )

  const onUpdate = (e) => {
    setVerifypassword({...verifyPassword,[e.target.name] : e.target.value});
  }

  const handleSubmit = async(e) => {
    e.preventDefault();
    console.log(verifyPassword);
    try{
      const response = await axios.post(`http://127.0.0.1:8000/emp/verify`,verifyPassword);
      // console.log(response);
      console.log(response.status);
      setError("false");
    }
    catch(error){
      if (error.response.status === 401){
        console.log("email or password mismatch");
        setError("401")
      }if(error.response.status === 404){
        console.log("No data found for this empid");
        setError("404")
      }else{
        console.log(error);
      }
    }
    
  }

  return(
        <div style={{display:"flex", flexDirection:"column",alignItems:"center", width:"250px"}}>
          
          <form onSubmit={handleSubmit}>
            <h2>Update password</h2>

            <input
              type="text"
              name="emp_id"
              placeholder="Employee ID"
              className="input-field"
              value={verifyPassword.emp_id}
              onChange={onUpdate}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              className="input-field"
              value={verifyPassword.email}
              onChange={onUpdate}
              required
            />

            <input 
              type="password"  
              name="password"
              placeholder="current password"
              value={verifyPassword.password}
              className="input-field"
              onChange={onUpdate}
              required
            />

            <button className="submit-btn">Proceed...</button>

          </form>
          
          {error === "404" && (<p style={{color:"red"}}>No data found for this empid</p>)}
          {error === "401" && (<p style={{color:"red"}}>Credentials mismatch</p>)}

          {error === "false" && (
            <div style={{display:"flex", flexDirection:"column",alignItems:"center"}}>

              <form onSubmit={
                async (e) =>  {
                  e.preventDefault();
                  
                  try{
                      // if(verifyPassword.password === newPasscode.new_password){
                      //   setError("old === new");
                      // }
                      // if (newPasscode.new_password !== newPasscode.confirm_new_password){
                      //   setError("passwords mismatch");
                      // }
                      await axios.put(`http://127.0.0.1:8000/emp/reset/${Number(verifyPassword.emp_id)}`,newPasscode);
                      setError("");
                      setVerifypassword({emp_id : "",email : "",password : ""});
                      toast.success('Password reset successfull!');

                    }catch(error){
                      toast.error("failed to update password")
                    }

                }
              }>
                <p style={{color:"green"}}>Good to go!</p>

                <input 
                  type="password"
                  name="new_password"
                  placeholder="new password"
                  className="input-field"
                  value={newPasscode.new_password}
                  onChange={(e) => {
                    setNewPasscode({...newPasscode,new_password : e.target.value})
                  }}
                  required
                />

                {(verifyPassword.password === newPasscode.new_password) && (<p style={{color:"red"}}>your new password can't be same as old one</p>) }


                <input 
                  type="password"
                  name="confirm_new_password"
                  placeholder="confirm new password"
                  className="input-field"
                  value={newPasscode.confirm_new_password}
                  onChange={(e) => {
                    setNewPasscode({...newPasscode,confirm_new_password : e.target.value});
                  }}
                  required
                />

                {(newPasscode.new_password !== newPasscode.confirm_new_password) ? (<p style={{color:"red"}}>Passwords mismatch</p>) : (<p style={{color:"green"}}>Passwords match</p>)}

                <button className="submit-btn">Change password</button>
              </form>
            </div>
          )}
        </div>
      )

}
