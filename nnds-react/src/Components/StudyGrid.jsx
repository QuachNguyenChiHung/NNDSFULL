
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudyGrid = () => {
    const [studyBlogs, setStudyBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStudyBlogs = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/blogs`);
                // Filter for study category and get first 4 blogs
                const studyOnly = response.data.filter(blog => blog.category === 'study').slice(0, 4);
                setStudyBlogs(studyOnly);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching study blogs:', error);
                setError('Failed to load study materials');
                setLoading(false);
            }
        };

        fetchStudyBlogs();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const truncateText = (text, maxLength) => {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    };

    if (loading) {
        return (
            <div className="container py-4 py-xl-5">
                <div className="d-flex justify-content-between align-items-center">
                    <h1>GÓC HỌC TẬP</h1>
                    <p><a href="/blog/category/study">Xem thêm</a></p>
                </div>
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Đang tải tài liệu học tập...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-4 py-xl-5">
                <div className="d-flex justify-content-between align-items-center">
                    <h1>GÓC HỌC TẬP</h1>
                    <p><a href="/blog/category/study">Xem thêm</a></p>
                </div>
                <div className="alert alert-warning text-center">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4 py-xl-5">
            <div className="d-flex justify-content-between align-items-center">
                <h1>GÓC HỌC TẬP</h1>
                <p><a href="/blog/category/study">Xem thêm</a></p>
            </div>

            <div className="row gy-4 row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4">
                {studyBlogs.length > 0 ? (
                    studyBlogs.map((blog) => (
                        <div key={blog.id} className="col">
                            <a href={`/blog/${blog.id}`} style={{ textDecoration: "none" }}>
                                <div className="card h-100">
                                    <img
                                        className="card-img-top w-100 d-block fit-cover"
                                        src={blog.thumbnail?.link || "/img/placeholder.png"}
                                        alt={blog.thumbnail?.alt || blog.blog_title}
                                        style={{ height: '200px', objectFit: 'cover' }}
                                    />
                                    <div className="card-body p-4 d-flex flex-column">
                                        <h4 className="card-title">{truncateText(blog.blog_title, 60)}</h4>
                                        <p className="card-text flex-grow-1">{truncateText(blog.introduction, 120)}</p>
                                        <div className="d-flex mt-auto">
                                            <div>
                                                <p className="fw-bold mb-0">{blog.author?.name || 'Admin'}</p>
                                                <p className="text-muted small mb-0">{formatDate(blog.created_at)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </div>
                    ))
                ) : (
                    <div className="col-12">
                        <div className="text-center">
                            <p className="text-muted">Chưa có tài liệu học tập nào được đăng tải.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudyGrid;
