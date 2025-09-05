
import { useEffect, useState } from "react";
import axios from 'axios'
import { useNavigate } from "react-router-dom";
const Login = () => {
    const [form, setForm] = useState({})
    const navigate = useNavigate()
    const fetchUser = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user/me`, { withCredentials: true })
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
            } else {
                navigate('/admin/blogs')
                return
            }
        } catch (e) {
            navigate('/login')
        }
    }
    useEffect(() => {
        fetchUser()
    }, [])
    const handlesubmit = async (e) => {
        e.preventDefault()
        if (!isValidEmail(form.mail)) { alert('enter a valid email') }
        else {
            try {
                const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/login`, form, {
                    withCredentials: true
                })
                alert(res.data.message)
                navigate('/admin/blogs')
            } catch (e) {
                alert(e.response?.data?.message || e.message)
            }
        }

    }
    const isValidEmail = (value) => {
        // RFC 5322-inspired, pragmatic email regex
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
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
                                <form className="w-100" method="post">
                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input className="form-control" type="email" name="email" placeholder="Email" onChange={(e) => setForm({ ...form, mail: e.currentTarget.value })} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Mật khẩu</label>
                                        <input className="form-control" type="password" name="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.currentTarget.value })} />
                                    </div>
                                    <div className="mb-3">
                                        <button className="btn d-block w-100 access" onClick={handlesubmit}>
                                            Login
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

export default Login;
