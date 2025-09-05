import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6 text-center">
                    <div className="mb-4">
                        <h1 className="display-1 fw-bold text-primary">404</h1>
                        <h2 className="h4 mb-3">Trang không tồn tại</h2>
                        <p className="lead text-muted mb-4">
                            Xin lỗi, trang mà bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
                        </p>
                    </div>

                    <div className="mb-4">
                        <img
                            src="/img/placeholder.png"
                            alt="Page not found"
                            className="img-fluid"
                            style={{ maxHeight: '300px', opacity: 0.7 }}
                        />
                    </div>

                    <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                        <Link
                            to="/"
                            className="btn btn-primary px-4"
                        >
                            <i className="bi bi-house me-2"></i>
                            Về trang chủ
                        </Link>
                        <button
                            onClick={() => window.history.back()}
                            className="btn btn-outline-secondary px-4"
                        >
                            <i className="bi bi-arrow-left me-2"></i>
                            Quay lại
                        </button>
                    </div>

                    <div className="mt-5">
                        <h5 className="mb-3">Có thể bạn quan tâm:</h5>
                        <div className="row">
                            <div className="col-sm-6 mb-3">
                                <div className="card h-100">
                                    <div className="card-body text-center">
                                        <i className="bi bi-newspaper display-6 text-primary mb-2"></i>
                                        <h6 className="card-title">Tin tức</h6>
                                        <p className="card-text small text-muted">
                                            Cập nhật tin tức mới nhất
                                        </p>
                                        <Link to="/#news" className="btn btn-sm btn-outline-primary">
                                            Xem tin tức
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-6 mb-3">
                                <div className="card h-100">
                                    <div className="card-body text-center">
                                        <i className="bi bi-book display-6 text-success mb-2"></i>
                                        <h6 className="card-title">Học tập</h6>
                                        <p className="card-text small text-muted">
                                            Tài liệu và bài viết học tập
                                        </p>
                                        <Link to="/#study" className="btn btn-sm btn-outline-success">
                                            Xem học tập
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <small className="text-muted">
                            Nếu bạn cho rằng đây là lỗi, vui lòng{' '}
                            <Link to="/contact" className="text-decoration-none">
                                liên hệ với chúng tôi
                            </Link>
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
