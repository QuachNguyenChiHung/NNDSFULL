import { useEffect, useRef, useState } from "react";
import axios from 'axios'
import { useNavigate } from "react-router-dom";

const OTP = () => {
    const [digits, setDigits] = useState(["", "", "", "", "", ""]);
    const inputsRef = useRef([]);
    const navigate = useNavigate();
    const [user, setUser] = useState(null)
    useEffect(() => {
        // Focus first field on mount
        inputsRef.current[0]?.focus();
    }, []);
    const fetchUser = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user/me`, {
                withCredentials: true
            });
            if (res.data.user.verified) {
                if (res.data.user.first_time) {
                    navigate('/login/reset-password')
                    return
                } else if (!res.data.user.name) {
                    navigate('/login/setInfo')
                    return
                } else {
                    navigate('/admin/blogs')
                    return;
                }
            }

            const userData = res.data.user || res.data;
            setUser(userData);
            try {
                const otpRes = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/otps`, {},
                    { withCredentials: true }
                )
            } catch (error) {

            }
        } catch (error) {
            alert(error.response.message)
            navigate('/login/')
        }
    }
    useEffect(() => {
        fetchUser();
    }, [])
    const setDigitAt = (index, value) => {
        setDigits((prev) => {
            const next = [...prev];
            next[index] = value;
            return next;
        });
    };

    const handleChange = (idx) => (e) => {
        const raw = e.target.value;
        // Accept only digits
        const onlyDigits = raw.replace(/\D/g, "");

        // Handle paste of multiple digits
        if (onlyDigits.length > 1) {
            const next = [...digits];
            for (let i = 0; i < onlyDigits.length && idx + i < 6; i++) {
                next[idx + i] = onlyDigits[i];
            }
            setDigits(next);
            const focusTo = Math.min(idx + onlyDigits.length, 5);
            inputsRef.current[focusTo]?.focus();
            return;
        }

        // Single char input
        const val = onlyDigits.slice(-1); // last digit
        setDigitAt(idx, val);
        if (val && idx < 5) inputsRef.current[idx + 1]?.focus();
    };

    const handleKeyDown = (idx) => (e) => {
        if (e.key === 'Backspace') {
            if (digits[idx]) {
                // Clear current digit
                setDigitAt(idx, "");
                return;
            }
            // Move focus back if empty
            if (idx > 0) inputsRef.current[idx - 1]?.focus();
        }
        if (e.key === 'ArrowLeft' && idx > 0) inputsRef.current[idx - 1]?.focus();
        if (e.key === 'ArrowRight' && idx < 5) inputsRef.current[idx + 1]?.focus();
    };

    const handlePaste = (idx) => (e) => {
        const text = (e.clipboardData || window.clipboardData).getData('text');
        const onlyDigits = text.replace(/\D/g, "");
        if (!onlyDigits) return;
        e.preventDefault();
        const next = [...digits];
        for (let i = 0; i < onlyDigits.length && idx + i < 6; i++) {
            next[idx + i] = onlyDigits[i];
        }
        setDigits(next);
        const focusTo = Math.min(idx + onlyDigits.length - 1, 5);
        inputsRef.current[focusTo]?.focus();
    };

    const submitOTP = async (e) => {
        e.preventDefault();
        const code = digits.join("");
        if (code.length !== 6) {
            alert('Vui lòng nhập đủ 6 số OTP');
            return;
        }
        try {
            // Placeholder call – adjust endpoint when backend verify exists
            // await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/otps/verify`, { code }, { withCredentials: true });
            alert(`OTP: ${code}`);
            // navigate to target page after verification
            // navigate('/admin/blogs');
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/otp/latest/me`, { otp_code: code }, {
                withCredentials: true
            })
            if (res.data.success) {
                try {
                    const updateRes = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/user/me`, { verified: 1 }, {
                        withCredentials: true
                    });
                    navigate('/login/reset-password');
                    return;
                } catch (error) {
                    alert(error.response.message)
                }
            }
        } catch (err) {
            alert(err.response?.data?.message || err.message);
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
                                <form className="w-100" onSubmit={submitOTP}>
                                    <p>Nhập mã OTP 6 số vừa gửi qua <strong>{user?.mail || 'abc@gmail.com'}</strong></p>
                                    <div className="mb-3">
                                        <label className="form-label">OTP</label>
                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                                            {digits.map((d, i) => (
                                                <input
                                                    key={i}
                                                    ref={(el) => (inputsRef.current[i] = el)}
                                                    value={d}
                                                    onChange={handleChange(i)}
                                                    onKeyDown={handleKeyDown(i)}
                                                    onPaste={handlePaste(i)}
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    maxLength={1}
                                                    className="form-control text-center"
                                                    style={{ width: 48, height: 48, fontSize: 20, textAlign: 'center' }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <button type="submit" className="btn d-block w-100 access">
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

export default OTP;
