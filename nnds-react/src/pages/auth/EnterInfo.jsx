
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const EnterInfo = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", dob: "" });

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user/me`, {
        withCredentials: true
      });
      if (!res.data.user.verified) {
        navigate('/login/otp');
        return;
      } else if (res.data.user.first_time) {
        navigate('/login/reset-password');
        return;
      } else if (!res.data.user.name) {
        navigate('/login/setInfo');
        return;
      }
    } catch (error) {
      alert(error.response?.data?.message || error.message);
      navigate('/login/');
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.dob) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/user/me`, {
        name: form.name,
        date_of_birth: form.dob
      }, {
        withCredentials: true
      });
      alert('Cập nhật thông tin thành công!');
      navigate('/admin/blogs');
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

  return (
    <section
      className="position-relative py-4 py-xl-5"
      style={{
        height: "100vh"
      }}
    >
      <div className="container">
        <div className="row gy-3 d-flex justify-content-center">
          <div className="col-12 text-center">
            <img
              src="/img/NNDS.png"
              alt="Logo"
              style={{ maxWidth: "100px", border: '1px solid', borderRadius: '1000px' }}
            />
          </div>
          <div className="col-md-6 col-xl-4">
            <div
              className="card mb-5"
              style={{ borderWidth: "2px", borderColor: "#8a71eb" }}
            >
              <div className="card-body d-flex flex-column align-items-center">
                <form className="w-100" method="post" onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Họ và tên</label>
                    <input
                      className="form-control"
                      type="text"
                      name="name"
                      placeholder="Name"
                      value={form.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Ngày sinh</label>
                    <input className="form-control" type="date" name="dob" value={form.dob} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <button className="btn d-block w-100 access" type="submit">
                      Xác nhận
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnterInfo;
