import React from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
const BlogPage = () => {
    const { id } = useParams();
    const [blogData, setBlogData] = useState(null);
    const [latestBlogs, setLatestBlogs] = useState([]);
    const [latestStudyBlogs, setLatestStudyBlogs] = useState([]);
    const [latestNewsBlogs, setLatestNewsBlogs] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/blogs/${id}`);
                setBlogData(res.data);
            } catch (error) {
                alert(error.response?.data?.message);
            }
        })();
    }, [id]);

    useEffect(() => {
        (async () => {
            try {
                const [latestRes, studyRes, newsRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/blogs`),
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/blogs/study`),
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/blogs/news`),
                ]);
                // Sort and slice for latest blogs (sidebar)
                const sortedLatest = [...latestRes.data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10);
                setLatestBlogs(sortedLatest);
                setLatestStudyBlogs(studyRes.data);
                setLatestNewsBlogs(newsRes.data);
            } catch (error) {
                // ignore sidebar errors
            }
        })();
    }, []);

    return (
        <div className="container mt-4" style={{ maxWidth: "1200px" }}>
            <div className="row">
                {/* Main Content */}
                {blogData === null ? <h1 className="col-12 col-lg-8">Bài blog không tồn tại !!</h1> :
                    <div className="col-12 col-lg-8">
                        <div className="row">
                            <div className="col-12">
                                <div className="w-100" id='title'>
                                    <h1
                                        className="fw-bolder text-center"
                                        style={{
                                            fontFamily: "Roboto, sans-serif",
                                            color: "#7e4cde",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        {blogData.blog_title}
                                    </h1>
                                </div>
                            </div>
                            <div className="col-12" id='introduction'>
                                <p style={{ textAlign: 'justify', hyphens: "auto", fontWeight: 'bolder', whiteSpace: 'pre-wrap !important', maxWidth: '100%' }}>
                                    {blogData.introduction}
                                </p>
                            </div>
                            <div className="col-12">
                                <div className="w-100" id='thumbnail'>
                                    <img
                                        className="w-100"
                                        src={blogData.thumbnail.link || '/img/placeholder.png'}
                                        alt={blogData.thumbnail.alt}
                                    />
                                </div>
                                <div className="w-100 d-flex justify-content-center">
                                    <p className='mt-3' >
                                        {blogData.thumbnail.alt || ''}
                                    </p>
                                </div>
                            </div>
                            <div className="col-12">
                                {blogData.blog_content.map((obj, index) => {

                                    return <div className="w-100">
                                        <h2
                                            className="fw-semibold"
                                            style={{ fontFamily: "Roboto, sans-serif", color: "#562ecc" }}
                                        >
                                            {`${index + 1}.${obj.heading}`}
                                        </h2>
                                        <p
                                            style={{
                                                textAlign: "justify",
                                                hyphens: "auto",
                                                borderColor: "rgb(0,0,0)",
                                            }}
                                        >
                                            {obj?.paragraph || ''}
                                        </p>
                                        <div className="row mt-4">
                                            <div className="col-12">
                                                <div className="w-100">
                                                    <img
                                                        className="w-100"
                                                        src={obj.img.link || '/img/placeholder.png'}
                                                        alt={obj.img.alt || '/img/placeholder.png'}
                                                    />
                                                </div>
                                                <div className="w-100 d-flex justify-content-center">
                                                    <p className='mt-3'>
                                                        {obj.img.alt || ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        {
                                            obj.youtube ?
                                                <div className="row mt-4">
                                                    <div className="col-12">
                                                        <div className="w-100">
                                                            <div className="responsive-iframe-container">
                                                                <iframe
                                                                    className="responsive-iframe"
                                                                    src={`https://www.youtube.com/embed/${new URL(obj.youtube).searchParams.get("v")}`}
                                                                    title="YouTube video"
                                                                    allowFullScreen
                                                                ></iframe>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                : null
                                        }

                                    </div>
                                })}



                            </div>

                        </div>
                    </div>}


                {/* Sidebar */}
                <div
                    className="col-4 d-none d-lg-block"
                    style={{
                        padding: "12px 12px",
                        borderRadius: "8px",
                        border: "4px solid #8a71eb",
                    }}
                >
                    <h5 style={{ color: "rgb(255,77,0)" }}>BÀI VIẾT MỚI NHẤT</h5>
                    {latestBlogs.map((blog, idx) => (
                        <a href={`/blog/${blog.id}`} style={{ textDecoration: "none", color: 'black' }}>
                            <div
                                key={blog.id}
                                className="d-flex align-items-xl-center mt-0 pt-0"
                                style={{
                                    paddingBottom: "16px",
                                    borderBottom: "2px solid rgb(193,196,198)",
                                }}
                            >
                                <div className="me-2">
                                    <img
                                        src={blog.thumbnail?.link || '/img/placeholder.png'}
                                        style={{ width: "90px", height: "60px" }}
                                        alt={blog.thumbnail?.alt || 'new'}
                                    />
                                </div>
                                <div>
                                    <a
                                        className="fw-normal h6"
                                        href={`/blog/${blog.id}`}
                                        style={{
                                            textDecoration: "none",
                                            fontFamily: "Roboto, sans-serif",
                                        }}
                                    >
                                        {blog.blog_title}
                                    </a>
                                </div>
                            </div>
                        </a>

                    ))}
                </div>
            </div>

            {/* Tin mới nhất */}
            <div className="container py-4 py-xl-5" style={{ maxWidth: "1200px" }}>
                <h2
                    className="fw-semibold"
                    style={{ fontFamily: "Roboto, sans-serif", color: "#562ecc" }}
                >
                    | TIN MỚI NHẤT
                </h2>
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

            {/* Góc học tập */}
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
            </div>
        </div>
    );
};

export default BlogPage;
