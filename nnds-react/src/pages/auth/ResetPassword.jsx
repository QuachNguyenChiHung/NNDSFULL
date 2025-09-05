
import { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
    const [form, setForm] = useState({});
    const navigate = useNavigate();
    const [uID, setUID] = useState(null);
    const fetchUser = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user/me`, {
                withCredentials: true
            });
            if (!res.data.user.verified) {
                navigate('/login/otp');
                return;
            }
            if (!res.data.user.first_time) {
                if (!res.data.user.name) {
                    navigate('/login/setInfo');
                    return;
                } else {
                    navigate('/admin/blogs');
                    return;
                }
            }
            setUID(res.data.user.id);
        } catch (error) {
            alert(error.response?.data?.message || error.message);
            navigate('/login');
        }
    };
    useEffect(() => {
        fetchUser();
    }, []);

    const handlesubmit = async (e) => {
        e.preventDefault();
        if (!form.password || !form.password1) {
            alert('Vui lòng nhập đầy đủ mật khẩu');
            return;
        }
        if (form.password !== form.password1) {
            alert('Mật khẩu xác nhận không khớp');
            return;
        }
        try {
            // Adjust endpoint as needed
            const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/user/me`, {
                password: form.password,
                first_time: 0
            }, {
                withCredentials: true
            });
            alert('Đổi mật khẩu thành công!');
            navigate('/login/setInfo');
        } catch (error) {
            alert(error.response?.data?.message || error.message);
        }
    };

    return (
        <section className="position-relative py-4 py-xl-5" style={{ height: "100vh" }}>
            <div className="container">
                <div className="row gy-3 d-flex justify-content-center">
                    <div className="col-12 text-center">
                        <img src="/img/NNDS.png" alt="Logo" style={{ maxWidth: "100px", border: '1px solid', borderRadius: '1000px' }} />
                    </div>
                    <div className="col-md-6 col-xl-4">
                        <div className="card mb-5" style={{ borderWidth: "2px", borderColor: "#8a71eb" }}>
                            <div className="card-body d-flex flex-column align-items-center">
                                <form className="w-100" method="post" onSubmit={handlesubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">Mật khẩu</label>
                                        <input className="form-control" type="password" name="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.currentTarget.value })} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Xác nhận mật khẩu</label>
                                        <input className="form-control" type="password" name="password1" placeholder="Confirm Password" onChange={(e) => setForm({ ...form, password1: e.currentTarget.value })} />
                                    </div>
                                    <div className="mb-3">
                                        <button className="btn d-block w-100 access" type="submit">
                                            Cài lại mật khẩu
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

export default ResetPassword;
