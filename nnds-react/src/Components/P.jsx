import { useEffect, useRef, useState } from "react";
export function P() {
    const bannerRef = useRef(null);
    const [height, setHeight] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    const images = [
        "img/group/pic3/kids 2.jpg",
        "img/ddda8.jpg"
    ];

    useEffect(() => {
        if (bannerRef.current) {
            setHeight(bannerRef.current.offsetHeight);
        }
    });

    useEffect(() => {
        const interval = setInterval(() => {
            // Start fade out
            setIsVisible(false);

            // After fade out completes, change image and fade in
            setTimeout(() => {
                setCurrentImageIndex(prevIndex =>
                    prevIndex === images.length - 1 ? 0 : prevIndex + 1
                );
                setIsVisible(true);
            }, 750); // Wait for fade out to complete
        }, 4000); // Change image every 5 seconds

        return () => clearInterval(interval);
    }, [images.length]);
    return (
        <>
            <section ref={bannerRef} className="banner-section text-white" style={{ minHeight: '400px', backgroundColor: '#303397' }}>
                <div className="container-fluid">
                    <div className="row align-items-center">
                        <div className="col-lg-5 col-12">
                            <div className="banner-content">
                                <p className="lead mb-4">
                                    Với hơn 15 năm kinh nghiệm, chúng tôi cam kết mang đến
                                    phương pháp học tiếng Anh hiệu quả nhất cho mọi lứa tuổi.
                                    Từ giao tiếp cơ bản đến luyện thi IELTS, TOEIC chuyên nghiệp.
                                </p>
                                <div className="banner-features mb-4">
                                    <div className="row">
                                        <div className="col-md-12 mb-3">
                                            <div className="d-flex align-items-center">
                                                <i className="fas fa-check-circle text-warning me-2"></i>
                                                <span className="lead fw-normal">Nói chuẩn — Tự nhiên như người bản xứ</span>
                                            </div>
                                        </div>
                                        <div className="col-md-12 mb-3">
                                            <div className="d-flex align-items-center">
                                                <i className="fas fa-check-circle text-warning me-2"></i>
                                                <span className="lead fw-normal">Phản xạ nhanh — Không sợ mất từ</span>
                                            </div>
                                        </div>
                                        <div className="col-md-12 mb-3">
                                            <div className="d-flex align-items-center">
                                                <i className="fas fa-check-circle text-warning me-2"></i>
                                                <span className="lead fw-normal">Ứng dụng thực tế — Phỏng vấn, du lịch, thuyết trình</span>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-7 col-12" style={{ padding: '0', height: '100%' }}>
                            <div className="banner-image text-center" style={{ position: 'relative', overflow: 'hidden' }}>
                                <img
                                    src={images[currentImageIndex]}
                                    alt="Học viên Ngoại ngữ Đạt San"
                                    className="shadow-lg"
                                    style={{
                                        width: '100%',
                                        height: '600px',
                                        objectFit: 'cover',
                                        opacity: isVisible ? 1 : 0,
                                        transform: isVisible ? 'scale(1)' : 'scale(1.05)',
                                        transition: 'all 1s ease-in-out'
                                    }}
                                />
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'linear-gradient(45deg, rgba(138, 113, 235, 0.1), rgba(235, 221, 113, 0.1))',
                                        opacity: isVisible ? 0.3 : 0,
                                        transition: 'opacity 0.75s ease-in-out',
                                        borderRadius: '8px',
                                        pointerEvents: 'none'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}