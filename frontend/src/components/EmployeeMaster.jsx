import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const initialForm = {
  code: '', name: '', department: '', designation: '',
  dob: '', doj: '', gender: '', salary: '', status: 'Active'
};

export default function EmployeeMaster() {
  const [form, setForm] = useState(initialForm);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const [emp, dept, desig] = await Promise.all([
      axios.get(`${API}/employees`),
      axios.get(`${API}/departments`),
      axios.get(`${API}/designations`)
    ]);
    setEmployees(emp.data);
    setDepartments(dept.data);
    setDesignations(desig.data);
  };

  // ---------- CLIENT-SIDE VALIDATION ----------
  const validate = () => {
    const errs = {};
    const today = new Date();

    // Code: numeric
    if (!form.code) errs.code = 'Code is required';
    else if (isNaN(form.code)) errs.code = 'Code must be numeric';

    // Name: alphabets, max 50
    if (!form.name) errs.name = 'Name is required';
    else if (!/^[A-Za-z\s]+$/.test(form.name)) errs.name = 'Name must be alphabets only';
    else if (form.name.length > 50) errs.name = 'Name max 50 characters';

    if (!form.department) errs.department = 'Department is required';
    if (!form.designation) errs.designation = 'Designation is required';

    // DOB: age >= 18
    if (!form.dob) {
      errs.dob = 'DOB is required';
    } else {
      const dob = new Date(form.dob);
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
      if (age < 18) errs.dob = 'Employee must be at least 18 years old';
    }

    // DOJ: not future
    if (!form.doj) {
      errs.doj = 'DOJ is required';
    } else if (new Date(form.doj) > today) {
      errs.doj = 'Date of Joining cannot be a future date';
    }

    if (!form.gender) errs.gender = 'Gender is required';

    // Salary: max 7 digits
    if (!form.salary) errs.salary = 'Salary is required';
    else if (isNaN(form.salary)) errs.salary = 'Salary must be a number';
    else if (parseFloat(form.salary) > 9999999.99) errs.salary = 'Salary max 7 digits';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setServerError('');
  };

  const handleAdd = async () => {
    if (!validate()) return;
    try {
      if (editId) {
        await axios.put(`${API}/employees/${editId}`, form);
        setEditId(null);
      } else {
        await axios.post(`${API}/employees`, form);
      }
      setForm(initialForm);
      fetchAll();
    } catch (err) {
      setServerError(err.response?.data?.error || 'Something went wrong');
    }
  };

  const handleEdit = (emp) => {
    setEditId(emp._id);
    setForm({
      code: emp.code,
      name: emp.name,
      department: emp.department._id,
      designation: emp.designation._id,
      dob: emp.dob?.split('T')[0],
      doj: emp.doj?.split('T')[0],
      gender: emp.gender,
      salary: emp.salary,
      status: emp.status
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete?')) {
      await axios.delete(`${API}/employees/${id}`);
      fetchAll();
    }
  };

  const handleCancel = () => {
    setForm(initialForm);
    setErrors({});
    setEditId(null);
    setServerError('');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2 style={{ textAlign: 'center', background: '#003580', color: '#fff', padding: '10px' }}>
        EMPLOYEE MASTER
      </h2>

      {serverError && <p style={{ color: 'red', fontWeight: 'bold' }}>{serverError}</p>}

      {/* FORM */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>

        {/* Code */}
        <div>
          <label>Code *</label>
          <input name="code" value={form.code} onChange={handleChange}
            style={inputStyle} placeholder="Numeric" />
          {errors.code && <span style={errStyle}>{errors.code}</span>}
        </div>

        {/* Name */}
        <div>
          <label>Name *</label>
          <input name="name" value={form.name} onChange={handleChange}
            style={inputStyle} placeholder="Alphabets only, max 50" />
          {errors.name && <span style={errStyle}>{errors.name}</span>}
        </div>

        {/* Department */}
        <div>
          <label>Department *</label>
          <select name="department" value={form.department} onChange={handleChange} style={inputStyle}>
            <option value="">-- Select --</option>
            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          {errors.department && <span style={errStyle}>{errors.department}</span>}
        </div>

        {/* Designation */}
        <div>
          <label>Designation *</label>
          <select name="designation" value={form.designation} onChange={handleChange} style={inputStyle}>
            <option value="">-- Select --</option>
            {designations.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          {errors.designation && <span style={errStyle}>{errors.designation}</span>}
        </div>

        {/* DOB */}
        <div>
          <label>DOB * (Age ≥ 18)</label>
          <input type="date" name="dob" value={form.dob} onChange={handleChange} style={inputStyle} />
          {errors.dob && <span style={errStyle}>{errors.dob}</span>}
        </div>

        {/* DOJ */}
        <div>
          <label>DOJ * (Not future)</label>
          <input type="date" name="doj" value={form.doj} onChange={handleChange} style={inputStyle} />
          {errors.doj && <span style={errStyle}>{errors.doj}</span>}
        </div>

        {/* Gender */}
        <div>
          <label>Gender *</label>
          <select name="gender" value={form.gender} onChange={handleChange} style={inputStyle}>
            <option value="">-- Select --</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && <span style={errStyle}>{errors.gender}</span>}
        </div>

        {/* Salary */}
        <div>
          <label>Salary * (Max 7 digits)</label>
          <input type="number" name="salary" value={form.salary} onChange={handleChange}
            style={inputStyle} placeholder="e.g. 23000.50" step="0.01" />
          {errors.salary && <span style={errStyle}>{errors.salary}</span>}
        </div>

        {/* Status */}
        <div>
          <label>Status</label>
          <select name="status" value={form.status} onChange={handleChange} style={inputStyle}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={handleAdd} style={btnStyle('#003580')}>
          {editId ? 'Update' : 'Add'}
        </button>
        <button onClick={handleCancel} style={btnStyle('#888')}>Cancel</button>
      </div>

      {/* GRID */}
      <table border="1" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead style={{ background: '#003580', color: '#fff' }}>
          <tr>
            <th>S.No</th><th>Code</th><th>Name</th><th>Department</th>
            <th>Designation</th><th>DOB</th><th>DOJ</th>
            <th>Gender</th><th>Salary</th><th>Status</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {employees.length === 0 && (
            <tr><td colSpan={11} style={{ textAlign: 'center', padding: '10px' }}>No records found</td></tr>
          )}
          {employees.map((emp, i) => (
            <tr key={emp._id} style={{ textAlign: 'center', background: i % 2 === 0 ? '#f9f9f9' : '#fff' }}>
              <td>{i + 1}</td>
              <td>{emp.code}</td>
              <td>{emp.name}</td>
              <td>{emp.department?.name}</td>
              <td>{emp.designation?.name}</td>
              <td>{new Date(emp.dob).toLocaleDateString('en-IN')}</td>
              <td>{new Date(emp.doj).toLocaleDateString('en-IN')}</td>
              <td>{emp.gender}</td>
              <td>{parseFloat(emp.salary).toFixed(2)}</td>
              <td>{emp.status}</td>
              <td>
                <button onClick={() => handleEdit(emp)} style={btnStyle('#f0a500', '6px 10px')}>Edit</button>
                <button onClick={() => handleDelete(emp._id)} style={btnStyle('red', '6px 10px')}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '7px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' };
const errStyle = { color: 'red', fontSize: '12px' };
const btnStyle = (bg, padding = '8px 20px') => ({
  background: bg, color: '#fff', border: 'none', borderRadius: '4px',
  padding, marginRight: '8px', cursor: 'pointer', fontWeight: 'bold'
});