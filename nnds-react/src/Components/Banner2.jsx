import { useEffect, useRef } from "react";

export function Banner2() {
    const bannerRef = useRef(null);

    useEffect(() => {
        const handleResize = () => {
            if (bannerRef.current) {
                const viewportHeight = window.innerHeight;
                const newHeight = Math.min(Math.max(viewportHeight, 400), 800);
                bannerRef.current.style.height = `${newHeight}px`;
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return (
        <>
            <section
                ref={bannerRef}
                className="banner2-section"
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100vh',
                    minHeight: '400px',
                    maxHeight: '800px',
                    overflow: 'hidden'
                }}
            >
                {/* Background Image */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundImage: 'url(img/group/pic3/Banner2.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center center',
                        backgroundRepeat: 'no-repeat',
                        zIndex: 1
                    }}
                />

                {/* Overlay */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(45deg, rgba(138, 113, 235, 0.7), rgba(235, 221, 113, 0.5))',
                        zIndex: 2
                    }}
                />

                {/* Content */}
                <div
                    className="container-fluid h-100"
                    style={{ position: 'relative', zIndex: 3 }}
                >
                    <div className="row h-100 align-items-center justify-content-center">
                        <div className="col-lg-8 col-md-10 col-12 text-center text-white">
                            <div className="banner2-content">
                                <h1
                                    className="display-4 fw-bold mb-4"
                                    style={{
                                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                                        fontSize: 'clamp(2rem, 5vw, 4rem)'
                                    }}
                                >
                                    Ngoại Ngữ Đạt San
                                </h1>
                                <p
                                    className="lead mb-4"
                                    style={{
                                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                                        fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
                                        maxWidth: '800px',
                                        margin: '0 auto'
                                    }}
                                >
                                    Hơn 15 năm kinh nghiệm đào tạo tiếng Anh chất lượng cao.
                                    Từ giao tiếp cơ bản đến luyện thi IELTS, TOEIC chuyên nghiệp.
                                </p>

                                <div className="banner2-features mb-4">
                                    <div className="row g-3 justify-content-center">
                                        <div className="col-md-4 col-sm-6 col-12">
                                            <div
                                                className="feature-item p-3"
                                                style={{
                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                    borderRadius: '15px',
                                                    backdropFilter: 'blur(10px)',
                                                    border: '1px solid rgba(255, 255, 255, 0.2)'
                                                }}
                                            >
                                                <i className="fas fa-check-circle text-warning mb-2" style={{ fontSize: '1.5rem' }}></i>
                                                <div style={{ fontSize: 'clamp(0.9rem, 2vw, 1.1rem)' }}>
                                                    Nói chuẩn như người bản xứ
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4 col-sm-6 col-12">
                                            <div
                                                className="feature-item p-3"
                                                style={{
                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                    borderRadius: '15px',
                                                    backdropFilter: 'blur(10px)',
                                                    border: '1px solid rgba(255, 255, 255, 0.2)'
                                                }}
                                            >
                                                <i className="fas fa-check-circle text-warning mb-2" style={{ fontSize: '1.5rem' }}></i>
                                                <div style={{ fontSize: 'clamp(0.9rem, 2vw, 1.1rem)' }}>
                                                    Phản xạ nhanh, tự tin giao tiếp
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4 col-sm-6 col-12">
                                            <div
                                                className="feature-item p-3"
                                                style={{
                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                    borderRadius: '15px',
                                                    backdropFilter: 'blur(10px)',
                                                    border: '1px solid rgba(255, 255, 255, 0.2)'
                                                }}
                                            >
                                                <i className="fas fa-check-circle text-warning mb-2" style={{ fontSize: '1.5rem' }}></i>
                                                <div style={{ fontSize: 'clamp(0.9rem, 2vw, 1.1rem)' }}>
                                                    Ứng dụng thực tế hiệu quả
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="banner2-cta">
                                    <button
                                        className="btn btn-warning btn-lg me-3 mb-2"
                                        style={{
                                            borderRadius: '25px',
                                            padding: '12px 30px',
                                            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                                            fontWeight: '600',
                                            boxShadow: '0 4px 15px rgba(235, 221, 113, 0.4)'
                                        }}
                                    >
                                        Đăng Ký Ngay
                                    </button>
                                    <button
                                        className="btn btn-outline-light btn-lg mb-2"
                                        style={{
                                            borderRadius: '25px',
                                            padding: '12px 30px',
                                            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                                            fontWeight: '600',
                                            border: '2px solid white'
                                        }}
                                    >
                                        Tìm Hiểu Thêm
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}