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
  };

  // Handling form submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    alert('form submitted');
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
              name="emp_id"
              placeholder="Emplyee ID"
              className="input-field"
              onChange={handleChange}
              value={formData.emp_id}
              required
            /><br></br>

            <input
              type="text"
              name="name"
              placeholder="Name"
              className="input-field"
              onChange={handleChange}
              value={formData.name}
              required
            />

            <br></br>
            <input
            type="text"
            name="dept"
            placeholder="Department"
            className="input-field"
            onChange={handleChange}
            value={formData.dept}
            required
            />

            <br></br>
            <input
            type="email"
            name="email"
            placeholder="Email"
            className="input-field"
            onChange={handleChange}
            value={formData.email}
            required
            />

            <br></br>
            <input
            type="password"
            name="password"
            placeholder="password"
            className="input-field"
            onChange={handleChange}
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
  const [users, setUsers] = useState([]);

  const userData = async() => {
    try{
      const response = await axios.get("http://127.0.0.1:8000/emp");
      setUsers(response.data);
      console.log(response.data);
    }catch(error){
      alert('error fetching users data')
    }
  }

  const deleteUser = async (emp_id) => {
    try {
      const id = parseInt(emp_id, 10);
      await axios.delete(`http://127.0.0.1:8000/emp/${(id)}`);
      alert(`Employee ${emp_id} deleted successfully`);
      setUsers(users.filter((u) => u.emp_id !== emp_id)); // updates UI
    } catch (error) {
      alert("Failed to delete user");
    }
  };

  return (
    <div style={{ marginLeft: "170px", marginTop:"30px" }}>
      <button onClick={userData} className="submit-btn">
        Get Users
      </button>

      {users.length === 0 ? ('') : 
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
                  <UserComp key={user.emp_id} user={user} onDelete={deleteUser}/>
                ))
              }
          </tbody>
        </table>
      )}
    </div>
  );
}

function UserComp({ user, onDelete }) {
  return (
    <tr>
      <td>{user.emp_id}</td>
      <td>{user.name}</td>
      <td>{user.dept}</td>
      <td>{user.email}</td>
      <td>
        <button className="update-btn" >Update</button>
      </td>
      <td>
        <button className="delete-btn" onClick={() => onDelete((user.emp_id))}>Delete</button>
      </td>
    </tr>
  );
}

