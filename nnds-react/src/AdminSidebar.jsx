import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminSidebar() {
    const { pathname } = useLocation();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user/me`, {
                    withCredentials: true
                });
                const userData = res.data.user || res.data;
                setUser(userData);
            } catch (error) {
                console.error('Failed to fetch user profile:', error);
            }
        };

        fetchUserProfile();

        // Listen for profile update events
        const handleProfileUpdate = (event) => {
            if (event.detail && event.detail.user) {
                setUser(event.detail.user);
            } else {
                // Re-fetch user data if no user data in event
                fetchUserProfile();
            }
        };

        // Add event listener for profile updates
        window.addEventListener('profileUpdated', handleProfileUpdate);

        // Cleanup event listener
        return () => {
            window.removeEventListener('profileUpdated', handleProfileUpdate);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/signout`, {}, {
                withCredentials: true
            });

            // Redirect to login page or home page
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
            // Force redirect even if logout API fails
            window.location.href = '/login';
        }
    };
    return (
        <aside
            style={{
                minWidth: 220,
                background: "#fff",
                height: "100vh",
                padding: 0,
                boxShadow: "2px 0 12px rgba(60,60,100,0.08)",
                borderRight: "1px solid #ececec",
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch"
            }}
        >
            <div style={{ textAlign: 'center', padding: 32, background: '#7e4cde', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
                <img src="/img/NNDS.png" alt="Logo" className="logo" />

            </div>
            <ul className="nav flex-column" style={{ marginTop: 32, gap: 8, padding: 0 }}>
                <li className={user?.role === 'admin' ? "nav-item" : "d-none nav-item"} style={{ marginBottom: 8 }}>
                    <Link
                        className={`nav-link d-flex align-items-center${pathname.includes("/admin/users") ? " active" : ""}`}
                        to="/admin/users"
                        style={{
                            color: pathname.includes("/admin/users") ? '#fff' : '#562ecc',
                            background: pathname.includes("/admin/users") ? '#7e4cde' : 'transparent',
                            borderRadius: 8,
                            padding: '12px 20px',
                            fontWeight: 500,
                            fontSize: 17,
                            transition: 'all 0.2s',
                            textDecoration: 'none',
                            boxShadow: pathname.includes("/admin/users") ? '0 2px 8px #e0d6f7' : 'none'
                        }}
                    >
                        <span className="me-2" role="img" aria-label="users">👤</span> Users
                    </Link>
                </li>
                <li className="nav-item">
                    <Link
                        className={`nav-link d-flex align-items-center${pathname.includes("/admin/blogs") ? " active" : ""}`}
                        to="/admin/blogs"
                        style={{
                            color: pathname.includes("/admin/blogs") ? '#fff' : '#562ecc',
                            background: pathname.includes("/admin/blogs") ? '#7e4cde' : 'transparent',
                            borderRadius: 8,
                            padding: '12px 20px',
                            fontWeight: 500,
                            fontSize: 17,
                            transition: 'all 0.2s',
                            textDecoration: 'none',
                            boxShadow: pathname.includes("/admin/blogs") ? '0 2px 8px #e0d6f7' : 'none'
                        }}
                    >
                        <span className="me-2" role="img" aria-label="blogs">📝</span>Blog của tôi
                    </Link>
                </li>
                <li className="nav-item">
                    <Link
                        className={`nav-link d-flex align-items-center${pathname.includes("/admin/profile") || pathname === "/profile" ? " active" : ""}`}
                        to="/admin/profile"
                        style={{
                            color: pathname.includes("/admin/profile") || pathname === "/profile" ? '#fff' : '#562ecc',
                            background: pathname.includes("/admin/profile") || pathname === "/profile" ? '#7e4cde' : 'transparent',
                            borderRadius: 8,
                            padding: '12px 20px',
                            fontWeight: 500,
                            fontSize: 17,
                            transition: 'all 0.2s',
                            textDecoration: 'none',
                            boxShadow: pathname.includes("/admin/profile") || pathname === "/profile" ? '0 2px 8px #e0d6f7' : 'none'
                        }}
                    >
                        <span className="me-2" role="img" aria-label="profile">👤</span>Thông tin người dùng
                    </Link>
                </li>
            </ul>
            <div style={{ flex: 1 }} />

            {/* User Profile Section */}
            {user && (
                <div style={{
                    padding: '0px 10px',
                    borderTop: '1px solid #ececec',
                    background: '#f8f9fa'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '8px'
                    }}>
                        <img
                            src={user.img_link || '/img/NNDS.png'}
                            alt="Profile"
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '2px solid #7e4cde'
                            }}
                            onError={(e) => {
                                e.target.src = '/img/default-avatar.png';
                            }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }} className="d-flex align-items-center">
                            <p style={{
                                margin: 0,
                                marginRight: '0.25rem',
                                fontWeight: '600',
                                fontSize: '14px',
                                color: '#562ecc',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                Welcome
                            </p>
                            <p style={{
                                margin: 0,
                                fontSize: '14px',
                                color: '#666',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {(user.name || 'User') + ' !'}
                            </p>
                        </div>
                    </div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: '-15px'
                    }}>
                        <span style={{
                            backgroundColor: user.role === 'admin' ? '#dc3545' : '#7e4cde',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '500',
                            textTransform: 'uppercase'
                        }}>
                            {user.role || 'User'}
                        </span>
                    </div>
                </div>
            )}

            {/* Logout Button */}
            <div style={{ padding: '16px 20px' }}>
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 16px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#c82333';
                        e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#dc3545';
                        e.target.style.transform = 'translateY(0)';
                    }}
                >
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                </button>
            </div>

            <div style={{ textAlign: 'center', padding: 16, fontSize: 13, color: '#aaa' }}>
                &copy; {new Date().getFullYear()} NNDS Admin
            </div>
        </aside>
    );
}
