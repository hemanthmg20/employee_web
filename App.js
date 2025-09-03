import { useState } from "react";
import './App.css';
import axios from 'axios';


export default function App(){
  return(
    <Form />
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
      alert(response.data.email);
      alert('User data submitted successfully');
      setFormData({emp_id:'',name:'',dept:'',email:'',password:''});
    }
    catch(error){
      console.error('error in form submission',error);
      alert('failed to submit form');
    }

  }
  return(
    <div style={{justifyContent:"center",display:"flex",marginTop:"130px"}}>
      <div style={{}}>
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
    </div>
  );
}

