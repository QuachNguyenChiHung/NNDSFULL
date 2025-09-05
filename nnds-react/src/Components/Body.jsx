import React, { useEffect } from 'react';
import { Card } from 'react-bootstrap';
import NewsGrid from './NewsGrid';
import StudyGrid from './StudyGrid';

export function Body() {
    useEffect(() => {
        const ids = [
            'programCarouselXXL', 'programCarouselLG', 'programCarouselMD', 'programCarouselSM',
            'reasonsCarouselXXL', 'reasonsCarouselLG', 'reasonsCarouselMD', 'reasonsCarouselSM'
        ];
        const handlers = {};
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            const handler = (e) => {
                const to = e.to;
                const indicators = el.querySelectorAll('.carousel-indicators [data-bs-slide-to]');
                indicators.forEach(btn => {
                    const idx = Number(btn.getAttribute('data-bs-slide-to'));
                    if (idx === to) {
                        btn.classList.add('active');
                        btn.setAttribute('aria-current', 'true');
                    } else {
                        btn.classList.remove('active');
                        btn.removeAttribute('aria-current');
                    }
                });
            };
            handlers[id] = handler;
            el.addEventListener('slid.bs.carousel', handler);
        });
        return () => {
            Object.entries(handlers).forEach(([id, handler]) => {
                const el = document.getElementById(id);
                if (el) el.removeEventListener('slid.bs.carousel', handler);
            });
        };
    }, []);

    // Equalize testimonial card heights (measure + apply min-height)
    useEffect(() => {
        const sectionSelector = '#testimonials';
        const adjustHeights = () => {
            const cards = Array.from(document.querySelectorAll(`${sectionSelector} .card`));
            if (!cards.length) return;
            // reset first
            cards.forEach(c => c.style.minHeight = '0');
            const max = cards.reduce((m, c) => Math.max(m, c.getBoundingClientRect().height), 0);
            cards.forEach(c => c.style.minHeight = `${Math.ceil(max)}px`);
        };
        adjustHeights();
        let t = null;
        const onResize = () => {
            clearTimeout(t);
            t = setTimeout(adjustHeights, 120);
        };
        window.addEventListener('resize', onResize);
        // also re-run after fonts/images load
        window.addEventListener('load', adjustHeights);
        return () => {
            window.removeEventListener('resize', onResize);
            window.removeEventListener('load', adjustHeights);
            clearTimeout(t);
        };
    }, []);

    // Ensure Bootstrap carousels are initialized programmatically (reliable in React)
    useEffect(() => {
        const ids = [
            'programCarouselXXL', 'programCarouselLG', 'programCarouselMD', 'programCarouselSM',
            'reasonsCarouselXXL', 'reasonsCarouselLG', 'reasonsCarouselMD', 'reasonsCarouselSM'
        ];
        const instances = [];
        if (typeof window !== 'undefined' && window.bootstrap && window.bootstrap.Carousel) {
            ids.forEach(id => {
                const el = document.getElementById(id);
                if (!el) return;
                try {
                    // reuse existing instance if present
                    let inst = window.bootstrap.Carousel.getInstance(el);
                    if (!inst) {
                        inst = new window.bootstrap.Carousel(el, { interval: 3000, ride: 'carousel', pause: 'hover' });
                    } else {
                        // update options if needed
                        try { inst._config.interval = 3000; } catch (e) { }
                    }
                    instances.push(inst);
                } catch (e) {
                    // ignore init errors
                }
            });
        }
        return () => {
            instances.forEach(i => {
                try { i.dispose(); } catch (e) { }
            });
        };
    }, []);

    return (<>
        <div className="container-fluid">
            <div className="row justify-content-center">
                <div className="col-xl-8 col-12 ">
                    <div id="intro" className="k intro container-fluid" style={{ marginTop: '2rem', maxWidth: '95vw', backgroundColor: '#303396' }}>
                        <div className=" row g-4 align-items-center ">
                            <div className='col-xl-3 col-md-4 col-12' >
                                <img alt="Portrait of Cuong - instructor" src="img/group/pic1/cuong.jpg" style={{ borderColor: '#ED1D78' }} />
                            </div>
                            <div className="col-md-8 col-12">
                                <p className='h5 text-white' style={{ textAlign: 'justify', lineHeight: '1.5' }}>Ngoại ngữ Đạt San được thành lập năm 2009 với mong muốn mang đến một môi trường học tiếng Anh thân thiện và hiệu quả. Từ những ngày đầu, chúng tôi luôn đặt chất lượng giảng dạy và sự tiến bộ của học viên lên hàng đầu. Đạt San tự hào với đội ngũ giáo viên tận tâm, chương trình học linh hoạt, từ giao tiếp hàng ngày đến luyện thi IELTS, TOEIC. Ngoài ra, chúng tôi còn hỗ trợ tư vấn du học, giúp học viên tự tin chạm đến ước mơ vươn xa ra thế giới.</p>
                            </div>
                        </div>

                    </div >
                </div>
            </div>

        </div>


        <section className="container-fluid reason" style={{ marginBottom: '3rem' }}>
            <h2>NHỮNG LÍ DO NÊN CHỌN NGOẠI NGỮ ĐẠT SAN</h2>


            {/* Large Screens Carousel (LG-XL): Shows 3 items */}
            <div id="reasonsCarouselLG" className="carousel slide d-none d-lg-block " data-bs-ride="carousel" data-bs-interval="3000">
                <div className="carousel-indicators" style={{ margin: '-2rem' }}>
                    <button type="button" data-bs-target="#reasonsCarouselLG" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
                    <button type="button" data-bs-target="#reasonsCarouselLG" data-bs-slide-to="1" aria-label="Slide 2"></button>
                </div>
                <div className="carousel-inner" >
                    {/* Slide 1: Items 1-3 */}
                    <div className="carousel-item active">
                        <div className=" row g-4 align-items-stretch">
                            <div className="h-100 col-4 reason-item">
                                <div>
                                    <h3>Đội ngũ Giáo viên chất lượng, tận tụy và giàu kinh nghiệm</h3>
                                    <img className="" src="img/ddda8.jpg" alt="" />
                                    <p className="">Đội ngũ giáo viên giàu kinh nghiệm, tận tâm và phương pháp giảng dạy hiện đại.</p>
                                </div>
                            </div>
                            <div className="h-100 col-4 reason-item">
                                <div>
                                    <h3>Chương trình học đa dạng hỗ trợ học viên mọi lứa tuổi</h3>
                                    <img className="" src="img/group/pic1/6e0c7181ad25137b4a3426.jpg" alt="" />
                                    <p className="">Phù hợp với mọi trình độ, từ cơ bản đến nâng cao, đi làm, đi thi chứng chỉ quốc tế.</p>
                                </div>
                            </div>
                            <div className="h-100 col-4 reason-item">
                                <div>
                                    <h3>Môi trường học tập thân thiện, năng động và bổ ích </h3>
                                    <img className="" src="img/group/pic1/d9e14e7f92db2c8575ca29.jpg" alt="" />
                                    <p className="">Không gian học tập hiện đại, tạo động lực và mang lại trải nghiệm học tập tích cực</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Slide 4: Items 4-6 */}
                    <div className="carousel-item">
                        <div className="row g-4 align-items-stretch">
                            <div className="h-100 col-4 reason-item">
                                <div>
                                    <h3>Phương pháp dạy thực tiễn nhằm ứng dụng đời sống</h3>
                                    <img className="" src="img/group/bangkhenjpg.jpeg" alt="" />
                                    <p className="">Áp dụng kỹ thuật giảng dạy tiên tiến và hiện đại giúp học viên tiến bộ nhanh .</p>
                                </div>
                            </div>
                            <div className="h-100 col-4 reason-item">
                                <div>
                                    <h3>Hỗ trợ học viên tận tình và chu đáo trong quá trình học</h3>
                                    <img className="" src="img/group/pic3/brentnew.png" alt="" />
                                    <p className="">Tư vấn lộ trình học tập, hỗ trợ học viên qua việc giải đáp các thắc mắc.</p>
                                </div>
                            </div>
                            <div className="h-100 col-4 reason-item">
                                <div>
                                    <h3>Lịch học linh hoạt với mọi trình độ và nhu cầu học viên</h3>
                                    <img className="" src="img/group/2.jpeg" alt="" />
                                    <p className="">Nhiều khung giờ học đa dạng, phù hợp với học sinh, sinh viên và người đi làm.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#reasonsCarouselLG" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#reasonsCarouselLG" data-bs-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Next</span>
                </button>
            </div>

            {/* Medium Screens Carousel (MD-LG): Shows 2 items */}
            <div id="reasonsCarouselMD" className="carousel slide d-none d-md-block d-lg-none" data-bs-ride="carousel" data-bs-interval="3000">
                <div className="carousel-indicators" style={{ margin: '-2rem' }}>
                    <button type="button" data-bs-target="#reasonsCarouselMD" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
                    <button type="button" data-bs-target="#reasonsCarouselMD" data-bs-slide-to="1" aria-label="Slide 2"></button>
                    <button type="button" data-bs-target="#reasonsCarouselMD" data-bs-slide-to="2" aria-label="Slide 3"></button>

                </div>
                <div className="carousel-inner">
                    {/* Slide 1: Items 1-2 */}
                    <div className="carousel-item active">
                        <div className="row g-4 align-items-stretch">
                            <div className="h-100 col-6 reason-item">
                                <div>
                                    <h3>Đội ngũ Giáo viên chất lượng, tận tụy và giàu kinh nghiệm</h3>
                                    <img className="" src="img/ddda8.jpg" alt="" />
                                    <p className="">Đội ngũ giáo viên giàu kinh nghiệm, tận tâm và phương pháp giảng dạy hiện đại.</p>
                                </div>
                            </div>
                            <div className="h-100 col-6 reason-item">
                                <div>
                                    <h3>Chương trình học đa dạng hỗ trợ học viên mọi lứa tuổi</h3>
                                    <img className="" src="img/group/pic1/6e0c7181ad25137b4a3426.jpg" alt="" />
                                    <p className="">Phù hợp với mọi trình độ, từ cơ bản đến nâng cao, đi làm, thi chứng chỉ quốc tế.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Slide 2: Items 3-4 */}
                    <div className="carousel-item">
                        <div className="row g-4 align-items-stretch">
                            <div className="h-100 col-6 reason-item">
                                <div>
                                    <h3>Môi trường học tập thân thiện, năng động và bổ ích </h3>
                                    <img className="" src="img/group/pic1/d9e14e7f92db2c8575ca29.jpg" alt="" />
                                    <p className="">Không gian học tập hiện đại, tạo động lực và mang lại trải nghiệm học tập tích cực</p>
                                </div>
                            </div>
                            <div className="h-100 col-6 reason-item">
                                <div>
                                    <h3>Phương pháp dạy thực tiễn nhằm ứng dụng đời sống</h3>
                                    <img className="" src="img/group/bangkhenjpg.jpeg" alt="" />
                                    <p className="">Áp dụng kỹ thuật giảng dạy tiên tiến và hiện đại giúp học viên tiến bộ nhanh .</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Slide 3: Items 5-6 */}
                    <div className="carousel-item">
                        <div className="row g-4 align-items-stretch">
                            <div className="h-100 col-6 reason-item">
                                <div>
                                    <h3>Hỗ trợ học viên tận tình và chu đáo trong quá trình học</h3>
                                    <img className="" src="img/group/pic3/brentnew.png" alt="" />
                                    <p className="">Tư vấn lộ trình học tập, hỗ trợ học viên qua việc giải đáp các thắc mắc.</p>
                                </div>
                            </div>
                            <div className="h-100 col-6 reason-item">
                                <div>
                                    <h3>Lịch học linh hoạt với mọi trình độ và nhu cầu học viên</h3>
                                    <img className="" src="img/group/2.jpeg" alt="" />
                                    <p className="">Nhiều khung giờ học đa dạng, phù hợp với học sinh, sinh viên và người đi làm.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#reasonsCarouselMD" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#reasonsCarouselMD" data-bs-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Next</span>
                </button>
            </div>

            {/* Small Screens Carousel (SM-): Shows 1 item */}
            <div id="reasonsCarouselSM" className="carousel slide d-block d-md-none" data-bs-ride="carousel" data-bs-interval="3000">
                <div className="carousel-indicators" style={{ margin: '-2rem' }}>
                    <button type="button" data-bs-target="#reasonsCarouselSM" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
                    <button type="button" data-bs-target="#reasonsCarouselSM" data-bs-slide-to="1" aria-label="Slide 2"></button>
                    <button type="button" data-bs-target="#reasonsCarouselSM" data-bs-slide-to="2" aria-label="Slide 3"></button>
                    <button type="button" data-bs-target="#reasonsCarouselSM" data-bs-slide-to="3" aria-label="Slide 4"></button>
                    <button type="button" data-bs-target="#reasonsCarouselSM" data-bs-slide-to="4" aria-label="Slide 5"></button>
                    <button type="button" data-bs-target="#reasonsCarouselSM" data-bs-slide-to="5" aria-label="Slide 6"></button>
                </div>
                <div className="carousel-inner">
                    {/* Slide 1: Item 1 */}
                    <div className="carousel-item active">
                        <div className="row g-4 align-items-stretch">
                            <div className="h-100 col-12 reason-item">
                                <div>
                                    <h3>Đội ngũ Giáo viên chất lượng, tận tụy và giàu kinh nghiệm</h3>
                                    <img className="" src="img/ddda8.jpg" alt="" />
                                    <p className="">Đội ngũ giáo viên giàu kinh nghiệm, tận tâm và phương pháp giảng dạy hiện đại.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Slide 2: Item 2 */}
                    <div className="carousel-item">
                        <div className="row g-4 align-items-stretch">
                            <div className="h-100 col-12 reason-item">
                                <div>
                                    <h3>Chương trình học đa dạng hỗ trợ học viên mọi lứa tuổi</h3>
                                    <img className="" src="img/group/pic1/6e0c7181ad25137b4a3426.jpg" alt="" />
                                    <p className="">Phù hợp với mọi trình độ, từ cơ bản đến nâng cao, đi làm, thi chứng chỉ quốc tế.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Slide 3: Item 3 */}
                    <div className="carousel-item">
                        <div className="row g-4 align-items-stretch">
                            <div className="h-100 col-12 reason-item">
                                <div>
                                    <h3>Môi trường học tập thân thiện, năng động và bổ ích </h3>
                                    <img className="" src="img/group/pic1/d9e14e7f92db2c8575ca29.jpg" alt="" />
                                    <p className="">Không gian học tập hiện đại, tạo động lực và mang lại trải nghiệm học tập tích cực</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Slide 4: Item 4 */}
                    <div className="carousel-item">
                        <div className="row g-4 align-items-stretch">
                            <div className="h-100 col-12 reason-item">
                                <div>
                                    <h3>Phương pháp dạy thực tiễn nhằm ứng dụng đời sống</h3>
                                    <img className="" src="img/group/bangkhenjpg.jpeg" alt="" />
                                    <p className="">Áp dụng kỹ thuật giảng dạy tiên tiến và hiện đại giúp học viên tiến bộ nhanh .</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Slide 5: Item 5 */}
                    <div className="carousel-item">
                        <div className="row g-4 align-items-stretch">
                            <div className="h-100 col-12 reason-item">
                                <div>
                                    <h3>Hỗ trợ học viên tận tình và chu đáo trong quá trình học</h3>
                                    <img className="" src="img/group/pic3/brentnew.png" alt="" />
                                    <p className="">Tư vấn lộ trình học tập, hỗ trợ học viên qua việc giải đáp các thắc mắc.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Slide 6: Item 6 */}
                    <div className="carousel-item">
                        <div className="row g-4 align-items-stretch">
                            <div className="h-100 col-12 reason-item">
                                <div>
                                    <h3>Lịch học linh hoạt với mọi trình độ và nhu cầu học viên</h3>
                                    <img className="" src="img/group/2.jpeg" alt="" />
                                    <p className="">Nhiều khung giờ học đa dạng, phù hợp với học sinh, sinh viên và người đi làm.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#reasonsCarouselSM" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#reasonsCarouselSM" data-bs-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Next</span>
                </button>
            </div>
        </section>
        <section id="chuongtrinh" className="container-fluid" style={{ marginTop: '1rem', marginBottom: '3rem' }}>
            <h2 className="text-center">CHƯƠNG TRÌNH TIẾNG ANH TẠI NGOẠI NGỮ ĐẠT SAN</h2>

            {/* Programs Carousel - Desktop (XXL): 4 items per view, slide by 1 */}
            <div id="programCarouselXXL" className="carousel slide d-none d-xxl-block" data-bs-ride="carousel" data-bs-interval="3000">
                <div className="carousel-indicators" style={{ margin: '-2rem' }}>
                    <button type="button" data-bs-target="#programCarouselXXL" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
                    <button type="button" data-bs-target="#programCarouselXXL" data-bs-slide-to="1" aria-label="Slide 2"></button>
                </div>
                <div className="carousel-inner" >
                    {/* Slide 1: 1,2,3,4 */}
                    <div className="carousel-item active">
                        <div className="row trinhdo g-3 justify-content-center">
                            <div className="col-md-6 col-lg-4 col-xxl-3 col-sm-6 col-12 justify-content-center">
                                <div className="program-card d-flex flex-column align-items-center text-center h-100">
                                    <h3>IELTS</h3>
                                    <img src="img/trinhdo/Ielts.jpg" alt="" />
                                    <p>Khóa học giúp học viên nâng cao kỹ năng Nghe, Nói, Đọc, Viết để đạt điểm cao trong kỳ thi IELTS, phù hợp với du học và định cư.</p>
                                </div>
                            </div>
                            <div className="col-md-6 col-lg-4 col-xxl-3 col-sm-6 col-12 justify-content-center">
                                <div className="program-card d-flex flex-column align-items-center text-center h-100">
                                    <h3>STARTERS</h3>
                                    <img src="img/trinhdo/starter.jpg" alt="" />
                                    <p>Chương trình dành cho trẻ em mới bắt đầu học tiếng Anh, giúp xây dựng nền tảng từ vựng, phát âm và giao tiếp cơ bản.</p>
                                </div>
                            </div>
                            <div className="col-md-6 col-lg-4 col-xxl-3 col-sm-6 col-12 justify-content-center">
                                <div className="program-card d-flex flex-column align-items-center text-center h-100">
                                    <h3>MOVERS</h3>
                                    <img src="img/trinhdo/mover.png" alt="" />
                                    <p>Bước tiếp theo trong lộ trình tiếng Anh thiếu nhi, giúp trẻ tự tin hơn với các kỹ năng giao tiếp và đọc viết cơ bản.</p>
                                </div>
                            </div>
                            <div className="col-md-6 col-lg-4 col-xxl-3 col-sm-6 col-12 justify-content-center">
                                <div className="program-card d-flex flex-column align-items-center text-center h-100">
                                    <h3>FLYERS</h3>
                                    <img src="img/trinhdo/flyer.jpg" alt="" />
                                    <p>Chương trình nâng cao cho trẻ, giúp củng cố từ vựng, ngữ pháp và kỹ năng ngôn ngữ để đạt chứng chỉ Flyers.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Slide 5: 5,6,7,8 */}
                    <div className="carousel-item">
                        <div className="row trinhdo g-3 justify-content-center">
                            <div className="col-md-6 col-lg-4 col-xxl-3 col-sm-6 col-12 justify-content-center">
                                <div className="program-card d-flex flex-column align-items-center text-center h-100">
                                    <h3>KET</h3>
                                    <img src="img/trinhdo/ket.jpg" alt="" />
                                    <p>Khóa học giúp học viên làm quen với kỳ thi tiếng Anh Cambridge, tập trung vào giao tiếp thực tế và nền tảng vững chắc.</p>
                                </div>
                            </div>
                            <div className="col-md-6 col-lg-4 col-xxl-3 col-sm-6 col-12 justify-content-center">
                                <div className="program-card d-flex flex-column align-items-center text-center h-100">
                                    <h3>PET</h3>
                                    <img src="img/trinhdo/pet.jpg" alt="" />
                                    <p> Dành cho người học muốn nâng cao kỹ năng sử dụng tiếng Anh trong đời sống và học tập, hướng đến chứng chỉ PET.</p>
                                </div>
                            </div>
                            <div className="col-md-6 col-lg-4 col-xxl-3 col-sm-6 col-12 justify-content-center">
                                <div className="program-card d-flex flex-column align-items-center text-center h-100">
                                    <h3>ANH VĂN GIAO TIẾP</h3>
                                    <img src="img/trinhdo/anhvangiaotiep.png" alt="" />
                                    <p> Giúp học viên tự tin giao tiếp trong công việc và cuộc sống với phương pháp giảng dạy thực tế, dễ ứng dụng vào đời sống.</p>
                                </div>
                            </div>
                            <div className="col-md-6 col-lg-4 col-xxl-3 col-sm-6 col-12 justify-content-center">
                                <div className="program-card d-flex flex-column align-items-center text-center h-100">
                                    <h3>TOEIC</h3>
                                    <img src="img/trinhdo/toiec.jpg" alt="" />
                                    <p>Luyện thi TOEIC chuyên sâu, tập trung vào từ vựng, ngữ pháp và kỹ năng nghe – đọc để đạt điểm cao trong kỳ thi quốc tế này.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#programCarouselXXL" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true" style={{ backgroundColor: '#8A71EB', borderRadius: '50%', width: '2.5rem', height: '2.5rem' }}></span>
                    <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#programCarouselXXL" data-bs-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true" style={{ backgroundColor: '#8A71EB', borderRadius: '50%', width: '2.5rem', height: '2.5rem' }}></span>
                    <span className="visually-hidden">Next</span>
                </button>
            </div>


            {/* Programs Carousel - Medium (MD): 2 items per view, slide by 1 */}
            <div className='justify-content-center d-flex' >
                <div id="programCarouselLG" className="carousel slide d-none d-lg-block d-xxl-none" style={{ maxWidth: '720px' }} data-bs-ride="carousel" data-bs-interval="3000">
                    <div className="carousel-indicators" style={{ margin: '-2rem' }}>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <button key={i} type="button" data-bs-target="#programCarouselLG" data-bs-slide-to={i} className={i === 0 ? 'active' : ''} aria-current={i === 0 ? 'true' : undefined} aria-label={`Slide ${i + 1}`}></button>
                        ))}
                    </div>
                    <div className="carousel-inner">
                        {/* Slide 1: 1,2 */}
                        <div className="carousel-item active">
                            <div className="row trinhdo g-3 justify-content-center">
                                <div className="col-6 justify-content-center">
                                    <div className="program-card d-flex flex-column align-items-center text-center h-100">
                                        <h3>IELTS</h3>
                                        <img src="img/trinhdo/Ielts.jpg" alt="" />
                                        <p>Khóa học giúp học viên nâng cao kỹ năng Nghe, Nói, Đọc, Viết để đạt điểm cao trong kỳ thi IELTS, phù hợp với du học và định cư.</p>
                                    </div>
                                </div>
                                <div className="col-6 justify-content-center">
                                    <div className="program-card d-flex flex-column align-items-center text-center h-100">
                                        <h3>STARTERS</h3>
                                        <img src="img/trinhdo/starter.jpg" alt="" />
                                        <p>Chương trình dành cho trẻ em mới bắt đầu học tiếng Anh, giúp xây dựng nền tảng từ vựng, phát âm và giao tiếp cơ bản.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="carousel-item">
                            <div className="row trinhdo g-3 justify-content-center">
                                <div className="col-6 justify-content-center">
                                    <div className="program-card d-flex flex-column align-items-center text-center h-100">
                                        <h3>MOVERS</h3>
                                        <img src="img/trinhdo/mover.png" alt="" />
                                        <p>Bước tiếp theo trong lộ trình tiếng Anh thiếu nhi, giúp trẻ tự tin hơn với các kỹ năng giao tiếp và đọc viết cơ bản.</p>
                                    </div>
                                </div>
                                <div className="col-6 justify-content-center">
                                    <div className="program-card d-flex flex-column align-items-center text-center h-100">
                                        <h3>FLYERS</h3>
                                        <img src="img/trinhdo/flyer.jpg" alt="" />
                                        <p>Chương trình nâng cao cho trẻ, giúp củng cố từ vựng, ngữ pháp và kỹ năng ngôn ngữ để đạt chứng chỉ Flyers.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="carousel-item">
                            <div className="row trinhdo g-3 justify-content-center">
                                <div className="col-6 justify-content-center">
                                    <div className="program-card d-flex flex-column align-items-center text-center h-100">
                                        <h3>KET</h3>
                                        <img src="img/trinhdo/ket.jpg" alt="" />
                                        <p>Khóa học giúp học viên làm quen với kỳ thi tiếng Anh Cambridge, tập trung vào giao tiếp thực tế và nền tảng vững chắc.</p>
                                    </div>
                                </div>
                                <div className="col-6 justify-content-center">
                                    <div className="program-card d-flex flex-column align-items-center text-center h-100">
                                        <h3>PET</h3>
                                        <img src="img/trinhdo/pet.jpg" alt="" />
                                        <p> Dành cho người học muốn nâng cao kỹ năng sử dụng tiếng Anh trong đời sống và học tập, hướng đến chứng chỉ PET.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="carousel-item">
                            <div className="row trinhdo g-3 justify-content-center">
                                <div className="col-6 justify-content-center">
                                    <div className="program-card d-flex flex-column align-items-center text-center h-100">
                                        <h3>ANH VĂN GIAO TIẾP</h3>
                                        <img src="img/trinhdo/anhvangiaotiep.png" alt="" />
                                        <p> Giúp học viên tự tin giao tiếp trong công việc và cuộc sống với phương pháp giảng dạy thực tế, dễ ứng dụng vào đời sống.</p>
                                    </div>
                                </div>
                                <div className="col-6 justify-content-center">
                                    <div className="program-card d-flex flex-column align-items-center text-center h-100">
                                        <h3>TOEIC</h3>
                                        <img src="img/trinhdo/toiec.jpg" alt="" />
                                        <p>Luyện thi TOEIC chuyên sâu, tập trung vào từ vựng, ngữ pháp và kỹ năng nghe – đọc để đạt điểm cao trong kỳ thi quốc tế này.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button className="carousel-control-prev" type="button" data-bs-target="#programCarouselLG" data-bs-slide="prev">
                        <span className="carousel-control-prev-icon" aria-hidden="true" style={{ backgroundColor: '#8A71EB', borderRadius: '50%', width: '2rem', height: '2rem' }}></span>
                        <span className="visually-hidden">Previous</span>
                    </button>
                    <button className="carousel-control-next" type="button" data-bs-target="#programCarouselLG" data-bs-slide="next">
                        <span className="carousel-control-next-icon" aria-hidden="true" style={{ backgroundColor: '#8A71EB', borderRadius: '50%', width: '2rem', height: '2rem' }}></span>
                        <span className="visually-hidden">Next</span>
                    </button>
                </div>
            </div>



            {/* Programs Carousel - Medium (MD): 2 items per view, slide by 1 */}
            <div id="programCarouselMD" className="carousel slide d-none d-md-block d-lg-none" data-bs-ride="carousel" data-bs-interval="3000">
                <div className="carousel-indicators" style={{ margin: '-2rem' }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <button key={i} type="button" data-bs-target="#programCarouselMD" data-bs-slide-to={i} className={i === 0 ? 'active' : ''} aria-current={i === 0 ? 'true' : undefined} aria-label={`Slide ${i + 1}`}></button>
                    ))}
                </div>
                <div className="carousel-inner" >
                    {/* Slide 1: 1,2 */}
                    <div className="carousel-item active">
                        <div className="row trinhdo g-3 justify-content-center">
                            <div className="col-6 justify-content-center">
                                <div className="program-card d-flex flex-column align-items-center text-center h-100">
                                    <h3>IELTS</h3>
                                    <img src="img/trinhdo/Ielts.jpg" alt="" />
                                    <p>Khóa học giúp học viên nâng cao kỹ năng Nghe, Nói, Đọc, Viết để đạt điểm cao trong kỳ thi IELTS, phù hợp với du học và định cư.</p>
                                </div>
                            </div>
                            <div className="col-6 justify-content-center">
                                <div className="program-card d-flex flex-column align-items-center text-center h-100">
                                    <h3>STARTERS</h3>
                                    <img src="img/trinhdo/starter.jpg" alt="" />
                                    <p>Chương trình dành cho trẻ em mới bắt đầu học tiếng Anh, giúp xây dựng nền tảng từ vựng, phát âm và giao tiếp cơ bản.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="carousel-item">
                        <div className="row trinhdo g-3 justify-content-center">
                            <div className="col-6 justify-content-center">
                                <div className="program-card d-flex flex-column align-items-center text-center h-100">
                                    <h3>MOVERS</h3>
                                    <img src="img/trinhdo/mover.png" alt="" />
                                    <p>Bước tiếp theo trong lộ trình tiếng Anh thiếu nhi, giúp trẻ tự tin hơn với các kỹ năng giao tiếp và đọc viết cơ bản.</p>
                                </div>
                            </div>
                            <div className="col-6 justify-content-center">
                                <div className="program-card d-flex flex-column align-items-center text-center h-100">
                                    <h3>FLYERS</h3>
                                    <img src="img/trinhdo/flyer.jpg" alt="" />
                                    <p>Chương trình nâng cao cho trẻ, giúp củng cố từ vựng, ngữ pháp và kỹ năng ngôn ngữ để đạt chứng chỉ Flyers.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="carousel-item">
                        <div className="row trinhdo g-3 justify-content-center">
                            <div className="col-6 justify-content-center">
                                <div className="program-card d-flex flex-column align-items-center text-center h-100">
                                    <h3>KET</h3>
                                    <img src="img/trinhdo/ket.jpg" alt="" />
                                    <p>Khóa học giúp học viên làm quen với kỳ thi tiếng Anh Cambridge, tập trung vào giao tiếp thực tế và nền tảng vững chắc.</p>
                                </div>
                            </div>
                            <div className="col-6 justify-content-center">
                                <div className="program-card d-flex flex-column align-items-center text-center h-100">
                                    <h3>PET</h3>
                                    <img src="img/trinhdo/pet.jpg" alt="" />
                                    <p> Dành cho người học muốn nâng cao kỹ năng sử dụng tiếng Anh trong đời sống và học tập, hướng đến chứng chỉ PET.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="carousel-item">
                        <div className="row trinhdo g-3 justify-content-center">
                            <div className="col-6 justify-content-center">
                                <div className="program-card d-flex flex-column align-items-center text-center h-100">
                                    <h3>ANH VĂN GIAO TIẾP</h3>
                                    <img src="img/trinhdo/anhvangiaotiep.png" alt="" />
                                    <p> Giúp học viên tự tin giao tiếp trong công việc và cuộc sống với phương pháp giảng dạy thực tế, dễ ứng dụng vào đời sống.</p>
                                </div>
                            </div>
                            <div className="col-6 justify-content-center">
                                <div className="program-card d-flex flex-column align-items-center text-center h-100">
                                    <h3>TOEIC</h3>
                                    <img src="img/trinhdo/toiec.jpg" alt="" />
                                    <p>Luyện thi TOEIC chuyên sâu, tập trung vào từ vựng, ngữ pháp và kỹ năng nghe – đọc để đạt điểm cao trong kỳ thi quốc tế này.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#programCarouselMD" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true" style={{ backgroundColor: '#8A71EB', borderRadius: '50%', width: '2rem', height: '2rem' }}></span>
                    <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#programCarouselMD" data-bs-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true" style={{ backgroundColor: '#8A71EB', borderRadius: '50%', width: '2rem', height: '2rem' }}></span>
                    <span className="visually-hidden">Next</span>
                </button>
            </div>

            {/* Programs Carousel - Small (SM): 1 item per view */}
            <div id="programCarouselSM" className="carousel slide d-block d-md-none" data-bs-ride="carousel" data-bs-interval="3000">
                <div className="carousel-indicators" style={{ margin: '-2rem' }}>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <button key={i} type="button" data-bs-target="#programCarouselSM" data-bs-slide-to={i} className={i === 0 ? 'active' : ''} aria-current={i === 0 ? 'true' : undefined} aria-label={`Slide ${i + 1}`}></button>
                    ))}
                </div>
                <div className="carousel-inner" style={{ paddingTop: '1rem' }}>
                    <div className="carousel-item active">
                        <div className="row trinhdo g-3 justify-content-center">
                            <div className="col-12 justify-content-center">
                                <div className="program-card d-flex flex-column align-items-center text-center h-100">
                                    <h3>IELTS</h3>
                                    <img src="img/trinhdo/Ielts.jpg" alt="" />
                                    <p>Khóa học giúp học viên nâng cao kỹ năng Nghe, Nói, Đọc, Viết để đạt điểm cao trong kỳ thi IELTS, phù hợp với du học và định cư.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="carousel-item">
                        <div className="row trinhdo g-3 justify-content-center">
                            <div className="col-12 justify-content-center">
                                <div className="program-card d-flex flex-column align-items-center text-center h-100">
                                    <h3>STARTERS</h3>
                                    <img src="img/trinhdo/starter.jpg" alt="" />
                                    <p>Chương trình dành cho trẻ em mới bắt đầu học tiếng Anh, giúp xây dựng nền tảng từ vựng, phát âm và giao tiếp cơ bản.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="carousel-item">
                        <div className="row trinhdo g-3 justify-content-center">
                            <div className="col-12 justify-content-center">
                                <div className="program-card d-flex flex-column align-items-center text-center h-100">
                                    <h3>MOVERS</h3>
                                    <img src="img/trinhdo/mover.png" alt="" />
                                    <p>Bước tiếp theo trong lộ trình tiếng Anh thiếu nhi, giúp trẻ tự tin hơn với các kỹ năng giao tiếp và đọc viết cơ bản.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="carousel-item">
                        <div className="row trinhdo g-3 justify-content-center">
                            <div className="col-12 justify-content-center">
                                <div className="program-card d-flex flex-column align-items-center text-center h-100">
                                    <h3>FLYERS</h3>
                                    <img src="img/trinhdo/flyer.jpg" alt="" />
                                    <p>Chương trình nâng cao cho trẻ, giúp củng cố từ vựng, ngữ pháp và kỹ năng ngôn ngữ để đạt chứng chỉ Flyers.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="carousel-item">
                        <div className="row trinhdo g-3 justify-content-center">
                            <div className="col-12 justify-content-center">
                                <div className="program-card d-flex flex-column align-items-center text-center h-100">
                                    <h3>KET</h3>
                                    <img src="img/trinhdo/ket.jpg" alt="" />
                                    <p>Khóa học giúp học viên làm quen với kỳ thi tiếng Anh Cambridge, tập trung vào giao tiếp thực tế và nền tảng vững chắc.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="carousel-item">
                        <div className="row trinhdo g-3 justify-content-center">
                            <div className="col-12 justify-content-center">
                                <div className="program-card d-flex flex-column align-items-center text-center h-100">
                                    <h3>PET</h3>
                                    <img src="img/trinhdo/pet.jpg" alt="" />
                                    <p> Dành cho người học muốn nâng cao kỹ năng sử dụng tiếng Anh trong đời sống và học tập, hướng đến chứng chỉ PET.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="carousel-item">
                        <div className="row trinhdo g-3 justify-content-center">
                            <div className="col-12 justify-content-center">
                                <div className="program-card d-flex flex-column align-items-center text-center h-100">
                                    <h3>ANH VĂN GIAO TIẾP</h3>
                                    <img src="img/trinhdo/anhvangiaotiep.png" alt="" />
                                    <p> Giúp học viên tự tin giao tiếp trong công việc và cuộc sống với phương pháp giảng dạy thực tế, dễ ứng dụng vào đời sống.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="carousel-item">
                        <div className="row trinhdo g-3 justify-content-center">
                            <div className="col-12 justify-content-center">
                                <div className="program-card d-flex flex-column align-items-center text-center h-100">
                                    <h3>TOEIC</h3>
                                    <img src="img/trinhdo/toiec.jpg" alt="" />
                                    <p>Luyện thi TOEIC chuyên sâu, tập trung vào từ vựng, ngữ pháp và kỹ năng nghe – đọc để đạt điểm cao trong kỳ thi quốc tế này.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#programCarouselSM" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true" style={{ backgroundColor: '#8A71EB', borderRadius: '50%', width: '1.8rem', height: '1.8rem' }}></span>
                    <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#programCarouselSM" data-bs-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true" style={{ backgroundColor: '#8A71EB', borderRadius: '50%', width: '1.8rem', height: '1.8rem' }}></span>
                    <span className="visually-hidden">Next</span>
                </button>
            </div>



        </section>
        <NewsGrid />
        <StudyGrid />
        <section id="testimonials" className='mt-4' style={{ backgroundColor: '#6f5bbdff', borderRadius: '3rem', padding: '1rem' }}>
            <div className="container">
                <h2 className='text-center text-light'>CẢM NGHĨ CỦA HỌC VIÊN VỀ NGOẠI NGỮ ĐẠT SAN</h2>
                <div className="row d-flex justify-content-center align-items-stretch mt-2 g-4">
                    <div className="col-lg-4 col-md-5 col-sm-6 col-12 h-100 d-flex">
                        <Card className="h-100 d-flex flex-column w-100" style={{ borderRadius: '1rem', border: '8px white solid' }}>
                            <Card.Header style={{ padding: '0', margin: '-1.6px', marginTop: '-1px' }}>
                                <video src="img/trankhanh.mp4" style={{ width: '100%', maxHeight: '600px', borderRadius: '1rem 1rem 0 0', border: 'none' }} controls preload="auto" playsInline></video>
                            </Card.Header>
                            <Card.Body className="flex-grow-1 d-flex align-items-center justify-content-center w-100">
                                <h3 className="text-center" style={{ color: '#6f5bbdff' }}>Trần Khánh</h3>
                            </Card.Body>
                        </Card>
                    </div>
                    <div className="col-lg-4 col-md-5 col-sm-6 col-12 h-100 d-flex">
                        <Card className="h-100 d-flex flex-column w-100" style={{ borderRadius: '1rem', border: '8px white solid' }}>
                            <Card.Header style={{ padding: '0', margin: '-1.6px', marginTop: '-1px' }}>
                                <video src="img/hung.mp4" style={{ width: '100%', maxHeight: '600px', borderRadius: '1rem 1rem 0 0', border: 'none' }} controls preload="auto" playsInline></video>
                            </Card.Header>
                            <Card.Body className="flex-grow-1 d-flex align-items-center justify-content-center w-100">
                                <h3 className="text-center" style={{ color: '#6f5bbdff' }}>Quách Nguyễn Chí Hùng</h3>
                            </Card.Body>
                        </Card>
                    </div>

                </div>
            </div>
        </section>
        <section className='mt-4' style={{ backgroundColor: '#247FC5', borderRadius: '3rem', padding: '1rem' }}>
            <div className="container">
                <h2 className='text-center text-light'>VIDEO GIỚI THIỆU NGOẠI NGỮ ĐẠT SAN</h2>
                <div className="row d-flex justify-content-center mt-2">
                    <div className='col-md-9 col-12'>
                        <video className='w-100' src="img/NNDS5.mp4" controls preload="auto" playsInline></video>
                    </div>
                </div>
            </div>
        </section>
    </>
    )
}