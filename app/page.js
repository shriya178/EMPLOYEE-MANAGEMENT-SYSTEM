'use client';

import { useState, useEffect, useRef, useReducer } from 'react';

// Country -> State -> City
const locations = {
  India: {
    Gujarat: ['Ahmedabad', 'Surat'],
    Maharashtra: ['Mumbai', 'Pune'],
  },
  USA: {
    California: ['Los Angeles', 'San Francisco'],
  },
};

// Employee Reducer
function employeeReducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return action.payload;

    case 'ADD':
      return [...state, action.payload];

    case 'UPDATE':
      return state.map((emp) =>
        emp.id === action.payload.id ? action.payload : emp,
      );

    case 'DELETE':
      return state.filter((emp) => emp.id !== action.payload);

    default:
      return state;
  }
}

export default function Home() {
  const emptyForm = {
    name: '',
    email: '',
    password: '',
    phone: '',
    gender: '',
    department: '',
    designation: '',
    country: '',
    state: '',
    city: '',
    skills: [],
    dob: '',
    joiningDate: '',
    address: '',
    salary: '',
    status: 'Active',
  };

  const [form, setForm] = useState(emptyForm);
  const [employees, dispatch] = useReducer(employeeReducer, []);
  const [loaded, setLoaded] = useState(false);
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [viewEmp, setViewEmp] = useState(null);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  const searchRef = useRef(null);
  const nameRef = useRef(null);

  // Load Local Storage
  useEffect(() => {
    try {
      const data = localStorage.getItem('employees');

      if (data) {
        const savedEmployees = JSON.parse(data);

        if (Array.isArray(savedEmployees)) {
          dispatch({ type: 'LOAD', payload: savedEmployees });
        }
      }
    } catch (error) {
      console.error('Unable to load employees:', error);
    }

    setLoaded(true);
  }, []);

  // Save Local Storage
  useEffect(() => {
    if (loaded) {
      localStorage.setItem('employees', JSON.stringify(employees));
    }
  }, [employees, loaded]);

  // Controlled Form
  function handleChange(e) {
    const { name, value } = e.target;

    if (name === 'country') {
      setForm({ ...form, country: value, state: '', city: '' });
    } else if (name === 'state') {
      setForm({ ...form, state: value, city: '' });
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  // Uncontrolled Input Example
  function handleUncontrolledName() {
    if (nameRef.current) {
      setForm({ ...form, name: nameRef.current.value });
    }
  }

  // Skills Checkbox
  function handleSkill(skill) {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  }

  // Validation
  function validate() {
    const err = {};
    const today = new Date().toLocaleDateString('en-CA');

    if (!/^[A-Za-z ]{3,}$/.test(form.name.trim())) {
      err.name = 'Enter at least 3 letters';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      err.email = 'Enter valid email';
    }

    if (form.password.length < 6) {
      err.password = 'Password must contain at least 6 characters';
    }

    if (!/^[0-9]{10}$/.test(form.phone)) {
      err.phone = 'Enter a valid 10 digit phone number';
    }

    if (!form.gender) err.gender = 'Select gender';
    if (!form.department) err.department = 'Select department';
    if (!form.designation) err.designation = 'Select designation';
    if (!form.country) err.country = 'Select country';
    if (!form.state) err.state = 'Select state';
    if (!form.city) err.city = 'Select city';

    if (form.skills.length === 0) {
      err.skills = 'Select at least one skill';
    }

    if (!form.dob) {
      err.dob = 'Select date of birth';
    } else if (form.dob >= today) {
      err.dob = 'Date of birth must be in the past';
    }

    if (!form.joiningDate) {
      err.joiningDate = 'Select joining date';
    } else if (form.dob && form.joiningDate <= form.dob) {
      err.joiningDate = 'Joining date must be after date of birth';
    } else if (form.joiningDate > today) {
      err.joiningDate = 'Joining date cannot be in the future';
    }

    if (form.address.trim().length < 5) {
      err.address = 'Enter a valid address';
    }

    if (!form.salary || Number(form.salary) <= 0) {
      err.salary = 'Enter a valid salary';
    }

    return err;
  }

  // Add / Update
  function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    // Rest Operator: Exclude password
    const { password, ...employeeData } = form;

    if (editId === null) {
      dispatch({
        type: 'ADD',
        payload: {
          ...employeeData,
          id: Date.now(),
        },
      });
    } else {
      dispatch({
        type: 'UPDATE',
        payload: {
          ...employeeData,
          id: editId,
        },
      });
    }

    setForm(emptyForm);
    setEditId(null);
    setErrors({});
    setViewEmp(null);
    setPage(1);
  }

  // Edit
  function handleEdit(emp) {
    setForm({
      ...emptyForm,
      ...emp,
      password: '',
    });

    setEditId(emp.id);
    setErrors({});
    setViewEmp(null);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Cancel
  function handleCancel() {
    setForm(emptyForm);
    setEditId(null);
    setErrors({});
  }

  // Delete
  function handleDelete(id) {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      dispatch({ type: 'DELETE', payload: id });

      if (viewEmp?.id === id) {
        setViewEmp(null);
      }
    }
  }

  // Search
  const filteredEmployees = employees.filter((emp) => {
    const text = search.toLowerCase();

    return (
      emp.name.toLowerCase().includes(text) ||
      emp.email.toLowerCase().includes(text) ||
      emp.phone.includes(text) ||
      emp.city.toLowerCase().includes(text) ||
      emp.department.toLowerCase().includes(text) ||
      emp.designation.toLowerCase().includes(text)
    );
  });

  // Sorting
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    let x = a[sortBy];
    let y = b[sortBy];

    if (sortBy === 'salary') {
      x = Number(x);
      y = Number(y);
    } else {
      x = String(x || '').toLowerCase();
      y = String(y || '').toLowerCase();
    }

    if (x < y) return order === 'asc' ? -1 : 1;
    if (x > y) return order === 'asc' ? 1 : -1;

    return 0;
  });

  // Pagination
  const totalPages = Math.max(Math.ceil(sortedEmployees.length / perPage), 1);

  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * perPage;

  const rows = sortedEmployees.slice(startIndex, startIndex + perPage);

  // Dashboard Summary
  const activeCount = employees.filter((emp) => emp.status === 'Active').length;

  const inactiveCount = employees.length - activeCount;

  // Location Dropdowns
  const stateList = form.country ? Object.keys(locations[form.country]) : [];

  const cityList =
    form.country && form.state ? locations[form.country][form.state] : [];

  // Error Message
  function errorText(field) {
    return errors[field] ? (
      <small className='text-danger'>{errors[field]}</small>
    ) : null;
  }

  return (
    <div>
      {/* Header */}
      <nav className='navbar navbar-dark bg-dark'>
        <div className='container'>
          <span className='navbar-brand'>Employee Management System</span>
        </div>
      </nav>

      <main className='container py-4'>
        {/* Dashboard */}
        <div className='row mb-4'>
          <div className='col-md-4 mb-2'>
            <div className='card card-body text-center'>
              <h6>Total Employees</h6>
              <h3>{employees.length}</h3>
            </div>
          </div>

          <div className='col-md-4 mb-2'>
            <div className='card card-body text-center'>
              <h6>Active Employees</h6>
              <h3>{activeCount}</h3>
            </div>
          </div>

          <div className='col-md-4 mb-2'>
            <div className='card card-body text-center'>
              <h6>Inactive Employees</h6>
              <h3>{inactiveCount}</h3>
            </div>
          </div>
        </div>

        {/* Employee Form */}
        <form
          className='card card-body mb-4'
          onSubmit={handleSubmit}
          noValidate
        >
          <h5 className='mb-3'>
            {editId === null ? 'Add Employee' : 'Edit Employee'}
          </h5>

          <div className='row'>
            {/* Uncontrolled Name Input */}
            <div className='col-md-6 mb-3'>
              <label className='form-label'>Employee Name</label>

              <input
                ref={nameRef}
                className='form-control'
                defaultValue={editId === null ? '' : form.name}
                key={editId ?? 'new'}
                onBlur={handleUncontrolledName}
              />

              {errorText('name')}
            </div>

            <div className='col-md-6 mb-3'>
              <label className='form-label'>Email Address</label>

              <input
                type='email'
                className='form-control'
                name='email'
                value={form.email}
                onChange={handleChange}
              />

              {errorText('email')}
            </div>

            <div className='col-md-6 mb-3'>
              <label className='form-label'>Password</label>

              <input
                type='password'
                className='form-control'
                name='password'
                value={form.password}
                onChange={handleChange}
                placeholder='Enter password'
              />

              {errorText('password')}
              <small className='text-muted d-block'>
                Password is validated but not stored.
              </small>
            </div>

            <div className='col-md-6 mb-3'>
              <label className='form-label'>Phone Number</label>

              <input
                type='tel'
                maxLength={10}
                className='form-control'
                name='phone'
                value={form.phone}
                onChange={handleChange}
              />

              {errorText('phone')}
            </div>

            {/* Gender */}
            <div className='col-md-6 mb-3'>
              <label className='form-label d-block'>Gender</label>

              {['Male', 'Female', 'Other'].map((g) => (
                <label className='me-3' key={g}>
                  <input
                    type='radio'
                    name='gender'
                    value={g}
                    checked={form.gender === g}
                    onChange={handleChange}
                  />{' '}
                  {g}
                </label>
              ))}

              {errorText('gender')}
            </div>

            {/* Status */}
            <div className='col-md-6 mb-3'>
              <label className='form-label d-block'>Status</label>

              {['Active', 'Inactive'].map((s) => (
                <label className='me-3' key={s}>
                  <input
                    type='radio'
                    name='status'
                    value={s}
                    checked={form.status === s}
                    onChange={handleChange}
                  />{' '}
                  {s}
                </label>
              ))}
            </div>

            {/* Department */}
            <div className='col-md-6 mb-3'>
              <label className='form-label'>Department</label>

              <select
                className='form-select'
                name='department'
                value={form.department}
                onChange={handleChange}
              >
                <option value=''>Select Department</option>
                {['HR', 'IT', 'Finance', 'Marketing'].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              {errorText('department')}
            </div>

            {/* Designation */}
            <div className='col-md-6 mb-3'>
              <label className='form-label'>Designation</label>

              <select
                className='form-select'
                name='designation'
                value={form.designation}
                onChange={handleChange}
              >
                <option value=''>Select Designation</option>
                {['Intern', 'Developer', 'Manager'].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              {errorText('designation')}
            </div>

            {/* Country */}
            <div className='col-md-4 mb-3'>
              <label className='form-label'>Country</label>

              <select
                className='form-select'
                name='country'
                value={form.country}
                onChange={handleChange}
              >
                <option value=''>Select Country</option>
                {Object.keys(locations).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {errorText('country')}
            </div>

            {/* State */}
            <div className='col-md-4 mb-3'>
              <label className='form-label'>State</label>

              <select
                className='form-select'
                name='state'
                value={form.state}
                onChange={handleChange}
              >
                <option value=''>Select State</option>
                {stateList.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              {errorText('state')}
            </div>

            {/* City */}
            <div className='col-md-4 mb-3'>
              <label className='form-label'>City</label>

              <select
                className='form-select'
                name='city'
                value={form.city}
                onChange={handleChange}
              >
                <option value=''>Select City</option>
                {cityList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {errorText('city')}
            </div>

            {/* Skills */}
            <div className='col-12 mb-3'>
              <label className='form-label d-block'>Skills</label>

              {['JavaScript', 'React', 'Node.js', 'Python'].map((s) => (
                <label className='me-3' key={s}>
                  <input
                    type='checkbox'
                    checked={form.skills.includes(s)}
                    onChange={() => handleSkill(s)}
                  />{' '}
                  {s}
                </label>
              ))}

              {errorText('skills')}
            </div>

            {/* DOB */}
            <div className='col-md-4 mb-3'>
              <label className='form-label'>Date of Birth</label>

              <input
                type='date'
                className='form-control'
                name='dob'
                value={form.dob}
                onChange={handleChange}
              />

              {errorText('dob')}
            </div>

            {/* Joining Date */}
            <div className='col-md-4 mb-3'>
              <label className='form-label'>Joining Date</label>

              <input
                type='date'
                className='form-control'
                name='joiningDate'
                value={form.joiningDate}
                onChange={handleChange}
              />

              {errorText('joiningDate')}
            </div>

            {/* Salary */}
            <div className='col-md-4 mb-3'>
              <label className='form-label'>Salary</label>

              <input
                type='number'
                min='1'
                className='form-control'
                name='salary'
                value={form.salary}
                onChange={handleChange}
              />

              {errorText('salary')}
            </div>

            {/* Address */}
            <div className='col-12 mb-3'>
              <label className='form-label'>Address</label>

              <textarea
                className='form-control'
                rows='2'
                name='address'
                value={form.address}
                onChange={handleChange}
              />

              {errorText('address')}
            </div>
          </div>

          <div>
            <button type='submit' className='btn btn-primary me-2'>
              {editId === null ? 'Save Employee' : 'Update Employee'}
            </button>

            {editId !== null && (
              <button
                type='button'
                className='btn btn-secondary'
                onClick={handleCancel}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Search, Sort and Pagination Settings */}
        <div className='row mb-3'>
          <div className='col-md-5 mb-2'>
            <input
              ref={searchRef}
              className='form-control'
              placeholder='Search name, email, phone, city...'
              onChange={() => {
                setSearch(searchRef.current.value);
                setPage(1);
              }}
            />
          </div>

          <div className='col-md-3 mb-2'>
            <select
              className='form-select'
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value='name'>Sort by Name</option>
              <option value='email'>Sort by Email</option>
              <option value='city'>Sort by City</option>
              <option value='department'>Sort by Department</option>
              <option value='salary'>Sort by Salary</option>
              <option value='joiningDate'>Sort by Joining Date</option>
            </select>
          </div>

          <div className='col-md-2 mb-2'>
            <select
              className='form-select'
              value={order}
              onChange={(e) => setOrder(e.target.value)}
            >
              <option value='asc'>Ascending</option>
              <option value='desc'>Descending</option>
            </select>
          </div>

          <div className='col-md-2 mb-2'>
            <select
              className='form-select'
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={15}>15 per page</option>
            </select>
          </div>
        </div>

        {/* Employee Table */}
        <div className='table-responsive'>
          <table className='table table-bordered table-striped align-middle'>
            <thead className='table-dark'>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Department</th>
                <th>City</th>
                <th>Salary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className='text-center'>
                    No employees found
                  </td>
                </tr>
              ) : (
                rows.map((emp, index) => (
                  <tr key={emp.id}>
                    <td>{startIndex + index + 1}</td>
                    <td>{emp.name}</td>
                    <td>{emp.email}</td>
                    <td>{emp.phone}</td>
                    <td>{emp.department}</td>
                    <td>{emp.city}</td>
                    <td>{emp.salary}</td>
                    <td>
                      <span
                        className={`badge ${emp.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td>
                      <div className='d-flex gap-1'>
                        <button
                          type='button'
                          className='btn btn-sm btn-info'
                          onClick={() => setViewEmp(emp)}
                        >
                          View
                        </button>

                        <button
                          type='button'
                          className='btn btn-sm btn-warning'
                          onClick={() => handleEdit(emp)}
                        >
                          Edit
                        </button>

                        <button
                          type='button'
                          className='btn btn-sm btn-danger'
                          onClick={() => handleDelete(emp.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className='d-flex flex-wrap justify-content-between align-items-center gap-2'>
          <span>
            Showing {rows.length ? startIndex + 1 : 0} to{' '}
            {startIndex + rows.length} of {sortedEmployees.length} employees
          </span>

          <ul className='pagination mb-0'>
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                className='page-link'
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
              >
                Previous
              </button>
            </li>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <li
                key={n}
                className={`page-item ${n === currentPage ? 'active' : ''}`}
              >
                <button className='page-link' onClick={() => setPage(n)}>
                  {n}
                </button>
              </li>
            ))}

            <li
              className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}
            >
              <button
                className='page-link'
                disabled={currentPage === totalPages}
                onClick={() => setPage(currentPage + 1)}
              >
                Next
              </button>
            </li>
          </ul>
        </div>

        {/* View Employee */}
        {viewEmp && (
          <div className='card card-body mt-4'>
            <h5>Employee Details</h5>

            <p>
              <b>Name:</b> {viewEmp.name}
            </p>
            <p>
              <b>Email:</b> {viewEmp.email}
            </p>
            <p>
              <b>Phone:</b> {viewEmp.phone}
            </p>
            <p>
              <b>Gender:</b> {viewEmp.gender}
            </p>
            <p>
              <b>Department:</b> {viewEmp.department}
            </p>
            <p>
              <b>Designation:</b> {viewEmp.designation}
            </p>
            <p>
              <b>Location:</b> {viewEmp.city}, {viewEmp.state},{' '}
              {viewEmp.country}
            </p>
            <p>
              <b>Skills:</b> {viewEmp.skills.join(', ')}
            </p>
            <p>
              <b>Date of Birth:</b> {viewEmp.dob}
            </p>
            <p>
              <b>Joining Date:</b> {viewEmp.joiningDate}
            </p>
            <p>
              <b>Salary:</b> {viewEmp.salary}
            </p>
            <p>
              <b>Status:</b> {viewEmp.status}
            </p>
            <p>
              <b>Address:</b> {viewEmp.address}
            </p>

            <button
              className='btn btn-secondary'
              onClick={() => setViewEmp(null)}
            >
              Close
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className='text-center py-3 border-top'>
        Employee Management System
      </footer>
    </div>
  );
}
