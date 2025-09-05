import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
export default function AdminUsers() {
	const [users, setUsers] = useState([]);
	const [form, setForm] = useState({
		name: "",
		mail: "",
		password: "",
		role: "teacher",
		phone_number: ""
	});
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [selectedUser, setSelectedUser] = useState(null);
	const [showViewModal, setShowViewModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [editForm, setEditForm] = useState({});
	const [selfID, setSelfID] = useState(null)
	const [search, setSearch] = useState("")
	const navigate = useNavigate()
	useEffect(() => {
		fetchUserdata();
		fetchUsers();
	}, [selfID]);

	const fetchUserdata = async () => {
		try {

			const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user/me`, {
				withCredentials: true
			});
			if (!res.data.user.verified) {
				alert("Tài khoản cần phải được xác nhận trước khi truy cập")
				navigate('/login/otp')
				return
			}
			else if (res.data.user.first_time) {
				alert("Tài khoản cần phải cài lại mật khẩu trước khi sử dụng")
				navigate('/login/reset-password')
				return
			} else if (!res.data.user.name) {
				navigate('/login/setInfo')
				return
			}
			if (res.data.user.role != 'admin') {
				navigate('/admin/profile')
			}
			setSelfID(res.data.user.id)
		} catch (error) {
			navigate('/login')
			alert('Invalid Session!!')
		}
	}
	async function fetchUsers() {
		try {
			const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users`, { withCredentials: true });
			const filterSelf = res.data.filter((item) => {
				return item.id != selfID
			})
			setUsers(filterSelf)
		} catch (e) {
			console.log('d')
			setError("Failed to fetch users");
		}
	}

	function handleChange(e) {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	}

	async function handleSubmit(e) {
		e.preventDefault();
		setError("");
		setSuccess("");
		try {
			await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/create-user`, form);
			setSuccess("User added!");
			setForm({ name: "", mail: "", password: "", role: "teacher", phone_number: "" });
			fetchUsers();
		} catch (e) {
			setError(e.response?.data?.message || "Failed to add user");

		}
	}

	function openViewModal(user) {
		setSelectedUser(user);
		setShowViewModal(true);
	}
	function openEditModal(user) {
		setEditForm({ ...user, bio_json: JSON.stringify(user.bio_json, null, 2) });
		setSelectedUser(user);
		setShowEditModal(true);
	}
	function openDeleteModal(user) {
		setSelectedUser(user);
		setShowDeleteModal(true);
	}
	function closeModals() {
		setShowViewModal(false);
		setShowEditModal(false);
		setShowDeleteModal(false);
		setSelectedUser(null);
	}

	function handleEditChange(e) {
		const { name, value } = e.target;
		setEditForm((prev) => ({ ...prev, [name]: value }));
	}

	async function handleUpdateUser(e) {
		e.preventDefault();
		setError("");
		setSuccess("");
		let bioObj;
		try {
			bioObj = editForm.bio_json ? JSON.parse(editForm.bio_json) : {};
		} catch {
			setError("bio_json must be valid JSON");
			return;
		}
		try {
			await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/users/${selectedUser.id}`, {
				...editForm,
				bio_json: bioObj
			});
			setSuccess("User updated!");
			closeModals();
			fetchUsers();
		} catch (e) {
			setError(e.response?.data?.message || "Failed to update user");
		}
	}

	async function handleDeleteUser() {
		setError("");
		setSuccess("");
		try {
			await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/users/${selectedUser.id}`);
			setSuccess("User deleted!");
			closeModals();
			fetchUsers();
		} catch (e) {
			setError(e.response?.data?.message || "Failed to delete user");
		}
	}

	// Derived filtered list based on search query (case-insensitive)
	const filteredUsers = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return users;
		return users.filter((u) => {
			const fields = [u?.name, u?.mail, u?.phone_number, u?.role];
			return fields.some((v) => String(v ?? "").toLowerCase().includes(q));
		});
	}, [search, users]);

	return (
		<div className="container py-4">
			<h2>User Management</h2>
			<div className="row g-2 mb-3 align-items-center">
				<div className="col-md-4 ms-auto">
					<input
						className="form-control"
						placeholder="Search by name, email, phone, or role"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
			</div>
			<form className="mb-4" onSubmit={handleSubmit}>
				<div className="row g-2 align-items-end">
					<div className="col-md-2">
						<input className="form-control" name="mail" value={form.mail} onChange={handleChange} placeholder="Email" required type="email" />
					</div>
					<div className="col-md-2">
						<select className="form-select" name="role" value={form.role} onChange={handleChange} required>
							<option value="teacher">Teacher</option>
							<option value="admin">Admin</option>
						</select>
					</div>

				</div>
				<div className="row g-2 mt-2 align-items-end">
					<div className="col-md-3">
						<button className="btn btn-primary" type="submit">Add User</button>
					</div>
				</div>
				{error && <div className="text-danger mt-2">{error}</div>}
				{success && <div className="text-success mt-2">{success}</div>}
			</form>
			<table className="table table-bordered table-striped">
				<thead>
					<tr>
						<th>Name</th>
						<th>Email</th>
						<th>Role</th>
						<th>Phone</th>
						<th>Bio</th>
						<th>Date Created</th>
						<th>Date of Birth</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{filteredUsers.length === 0 ? (
						<tr>
							<td colSpan={7} className="text-center">No users found.</td>
						</tr>
					) : (
						filteredUsers.map(user => {

							return (
								<tr key={user.id}>
									<td>{user.name}</td>
									<td>{user.mail}</td>
									<td>{user.role}</td>
									<td>{user.phone_number}</td>
									<td>
										<button className="btn btn-outline-secondary btn-sm w-100" style={{ minWidth: 80 }} onClick={() => openViewModal({ ...user, onlyBio: true })}>
											View Bio
										</button>
									</td>
									<td>{new Date(user.date_created).toLocaleDateString('en-GB')}</td>
									<td>{user.date_of_birth}</td>
									<td>
										<button className="btn btn-info btn-sm me-1" onClick={() => openViewModal(user)}>View</button>
										<button className="btn btn-warning btn-sm me-1" onClick={() => openEditModal(user)}>Update</button>
										<button className="btn btn-danger btn-sm" onClick={() => openDeleteModal(user)}>Delete</button>
									</td>
								</tr>
							)
						})
					)}
				</tbody>
			</table>

			{/* View Modal (User Details or Bio) */}
			{showViewModal && selectedUser && (
				<div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.3)" }}>
					<div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 400, width: '90vw' }}>
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">{selectedUser.onlyBio ? 'User Bio' : 'User Details'}</h5>
								<button type="button" className="btn-close" onClick={closeModals}></button>
							</div>
							<div className="modal-body">
								{selectedUser.onlyBio ? (
									selectedUser.bio_json && typeof selectedUser.bio_json === 'object' && Object.keys(selectedUser.bio_json).length > 0 ? (
										<table className="table table-sm mb-0">
											<tbody>
												{Object.entries(selectedUser.bio_json).map(([key, value]) => (
													<tr key={key}>
														<td style={{ fontWeight: 'bold', width: '40%' }}>{key}</td>
														<td style={{ wordBreak: 'break-all' }}>{String(value)}</td>
													</tr>
												))}
											</tbody>
										</table>
									) : (
										<span style={{ color: '#888' }}>(empty)</span>
									)
								) : (
									<table className="table table-bordered w-auto">
										<tbody>
											<tr><th>Name</th><td>{selectedUser.name}</td></tr>
											<tr><th>Email</th><td>{selectedUser.mail}</td></tr>
											<tr><th>Role</th><td>{selectedUser.role}</td></tr>
											<tr><th>Phone</th><td>{selectedUser.phone_number}</td></tr>
											<tr><th>Date Created</th><td>{new Date(selectedUser.date_created).toLocaleDateString('en-GB')}</td></tr>
										</tbody>
									</table>
								)}
							</div>
							<div className="modal-footer">
								<button className="btn btn-secondary w-100" onClick={closeModals}>Close</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Edit Modal */}
			{showEditModal && selectedUser && (
				<div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.3)" }}>
					<div className="modal-dialog">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">Update User</h5>
								<button type="button" className="btn-close" onClick={closeModals}></button>
							</div>
							<form onSubmit={handleUpdateUser}>
								<div className="modal-body">
									<div className="mb-2">
										<label>Name</label>
										<input className="form-control" name="name" value={editForm.name || ""} onChange={handleEditChange} />
									</div>
									<div className="mb-2">
										<label>Email</label>
										<input className="form-control" name="mail" value={editForm.mail || ""} onChange={handleEditChange} type="email" />
									</div>
									<div className="mb-2">
										<label>Role</label>
										<select className="form-select" name="role" value={editForm.role || ""} onChange={handleEditChange} required>
											<option value="teacher">Teacher</option>
											<option value="admin">Admin</option>
										</select>
									</div>
									<div className="mb-2">
										<label>Phone</label>
										<input className="form-control" name="phone_number" value={editForm.phone_number || ""} onChange={handleEditChange} />
									</div>
									<div className="mb-2">
										<label>bio_json</label>
										<input className="form-control" name="bio_json" value={editForm.bio_json || ""} onChange={handleEditChange} />
									</div>
								</div>
								<div className="modal-footer">
									<button className="btn btn-secondary" type="button" onClick={closeModals}>Cancel</button>
									<button className="btn btn-primary" type="submit">Update</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			{/* Delete Modal */}
			{showDeleteModal && selectedUser && (
				<div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.3)" }}>
					<div className="modal-dialog">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">Confirm Delete</h5>
								<button type="button" className="btn-close" onClick={closeModals}></button>
							</div>
							<div className="modal-body">
								<p>Are you sure you want to delete user <b>{selectedUser.name}</b>?</p>
							</div>
							<div className="modal-footer">
								<button className="btn btn-secondary" onClick={closeModals}>Cancel</button>
								<button className="btn btn-danger" onClick={handleDeleteUser}>Delete</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}