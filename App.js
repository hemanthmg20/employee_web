import { useState } from "react";
import './App.css';
import axios from 'axios';


export default function App(){
  return(
    <div style={{display:"flex",marginTop:"30px"}}>
    <Form />
    <Userlist />
    </div>
  );
}


function Form(){
  const [formData, setFormData] = useState(
    {
      emp_id:'',
      name:'',
      dept:'',
      email:'',
      password:'',
    }
  );

  // Handling input change
  const handleChange = (e) => {
    setFormData({...formData, [e.target.name] : e.target.value }); 
    // [e.target.name] is a computed property syntax. JS will evaluate this expression and use its result as a key
  };

  // Handling form submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    // alert('form submitted');
    console.log(formData);

    try{
      const response = await axios.post('http://127.0.0.1:8000/emp',formData)
      console.log("Response from server :", response.data);
      alert(`Hello ${response.data.name}, data submitted successfully!`);
      setFormData({emp_id:'',name:'',dept:'',email:'',password:''});
    }
    catch(error){
      console.error('error in form submission',error);
      alert('failed to submit form');
    }

  }
  return(
    // <div style={{}}>
      <div style={{marginLeft:"100px"}}>
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
            /><br></br>

            <input
              type="text"
              placeholder="Name"
              className="input-field"
              onChange={handleChange}
              name="name"
              value={formData.name}
              required
            />

            <br></br>
            <input
            type="text"
            placeholder="Department"
            className="input-field"
            onChange={handleChange}
            name="dept"
            value={formData.dept}
            required
            />

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

            <br></br>
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
      alert(`Employee ${emp_id} deleted successfully`);
      setUsers(users.filter((u) => u.emp_id !== emp_id)); // updating state after deletion which intern disappear on the UI
    } catch (error) {
      alert("Failed to delete user");
    }
  };

  // setting editingUser (state object) from null to current user data upon clicking update button so that it conditionally render the update form in the UI
  const handleEditClick = (user) => {
    setEditingUser(user);
  }

  return (
    <div style={{ display:"flex", flexDirection:"column",alignItems:"center",width:"1000px" }}>

      <button onClick={userData} className="submit-btn">
        Get Users
      </button>

      {errorResponse === true ? (
        <p>No Employees found!</p>
        ): ('')
      }

      {users.length === 0  ? ('') : 
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
          <h3 style={{color:"gray"}}>Update Employee</h3>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try{
                const response = await axios.put(`http://127.0.0.1:8000/emp/${editingUser.emp_id}`,editingUser);
                console.log(response.status);
              alert('Employee data updated successfully');

              // updating the users state object so that it reflect on the UI
              setUsers(users.map((u) => u.emp_id === editingUser.emp_id ? editingUser : u));

              // Closing the edit form by setting editingUser back to null
              setEditingUser(null);
              }catch(error){

                alert('Falied to update user data')
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
            /><br></br>

            <input 
              type="text"
              value={editingUser.dept}
              onChange={(e) =>
                setEditingUser({...editingUser,dept:e.target.value})
              }
              placeholder="Department"
              className="input-field"
            /><br></br>

            <input
              type="email"
              value={editingUser.email}
              onChange={(e) =>
                setEditingUser({ ...editingUser, email: e.target.value })
              }
              placeholder="Email"
              className="input-field"
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

