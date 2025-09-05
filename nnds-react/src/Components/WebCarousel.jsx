export function WebCarousel() {
    return (
        <>
            <div className="banner">
                <div className="carousel-wrapper">
                    <div id="carousel" className="carousel slide full-height-carousel" data-bs-ride="carousel">
                        <div className="carousel-inner">
                            <div className="carousel-item active" data-bs-interval="2000">
                                <div><img src="img/group/pic1/9acb3199ed3d53630a2c21.jpg" alt="Slide 1" className="d-block w-100 carousel-img" /></div>
                            </div>
                            <div className="carousel-item" data-bs-interval="2000">
                                <div><img src="img/group/pic1/c78bf04e2cea92b4cbfb38.jpg" alt="Slide 2" className="d-block w-100 carousel-img" /></div>
                            </div>
                            <div className="carousel-item" data-bs-interval="2000">
                                <div><img src="img/group/pic1/cd8750988c3c32626b2d13.jpg" alt="Slide 3" className="d-block w-100 carousel-img" /></div>
                            </div>
                        </div>
                        <button className="carousel-control-prev" type="button" data-bs-target="#carousel" data-bs-slide="prev">
                            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Previous</span>
                        </button>
                        <button className="carousel-control-next" type="button" data-bs-target="#carousel" data-bs-slide="next">
                            <span className="carousel-control-next-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Next</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}