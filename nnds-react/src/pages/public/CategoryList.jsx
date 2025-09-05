import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
const NewsList = () => {
    const [latestNewsBlogs, setLatestNewsBlogs] = useState([]);

    const { category } = useParams();
    useEffect(() => {
        (async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/blogs/`);
                // Sort and slice for latest blogs (sidebar)
                const getCate = res.data.filter((item) => item.category == category)
                const sorted = getCate.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                setLatestNewsBlogs(sorted)
            } catch (error) {
                // ignore sidebar errors
            }
        })();
    }, []);

    return (
        <div className="container mt-4" style={{ maxWidth: "1200px" }}>
            {/* Tin mới nhất */}
            <div className="container py-4 py-xl-5" style={{ maxWidth: "1200px" }}>
                <div className="row">
                    {latestNewsBlogs.map((blog) => (
                        <div key={blog.id} className="col-12 col-md-6">
                            <a href={`/blog/${blog.id}`} style={{ textDecoration: "none" }}>
                                <div
                                    className="d-flex align-items-xl-center mt-0 pt-0"
                                    style={{
                                        color: "black",
                                        textDecoration: "none",
                                        paddingBottom: "16px",
                                        borderBottom: "2px solid rgb(193,196,198)",
                                    }}
                                >
                                    <div className="me-2">
                                        <img
                                            src={blog.thumbnail?.link || '/img/placeholder.png'}
                                            style={{ width: "150px", height: "100px" }}
                                            alt={blog.thumbnail?.alt || 'new'}
                                        />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: "18px" }}>
                                            {blog.blog_title}
                                        </p>
                                        <p className="h6">Người đăng: {blog.author?.name || blog.username || 'Ẩn danh'}</p>
                                    </div>
                                </div>
                            </a>
                        </div>
                    ))}
                </div>
            </div>

            {/* Góc học tập
            <div className="container py-4 py-xl-5" style={{ maxWidth: "1200px" }}>
                <h2
                    className="fw-semibold"
                    style={{ fontFamily: "Roboto, sans-serif", color: "#562ecc" }}
                >
                    | GÓC HỌC TẬP
                </h2>
                <div className="row">
                    {latestStudyBlogs.map((blog) => (
                        <div key={blog.id} className="col-12 col-md-6">
                            <a href={`/blog/${blog.id}`} style={{ textDecoration: "none" }}>
                                <div
                                    className="d-flex align-items-xl-center mt-0 pt-0"
                                    style={{
                                        color: "black",
                                        textDecoration: "none",
                                        paddingBottom: "16px",
                                        borderBottom: "2px solid rgb(193,196,198)",
                                    }}
                                >
                                    <div className="me-2">
                                        <img
                                            src={blog.thumbnail?.link || '/img/placeholder.png'}
                                            style={{ width: "150px", height: "100px" }}
                                            alt={blog.thumbnail?.alt || 'study'}
                                        />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: "18px" }}>
                                            {blog.blog_title}
                                        </p>
                                        <p className="h6">Người đăng: {blog.author?.name || blog.username || 'Ẩn danh'}</p>
                                    </div>
                                </div>
                            </a>
                        </div>
                    ))}
                </div>
            </div> */}
        </div>
    );
};

export default NewsList;
