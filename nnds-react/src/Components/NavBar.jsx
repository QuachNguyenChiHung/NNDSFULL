export function NavBar() {
    return (
        <>
            <header className="d-lg-none d-flex justify-content-center">
                <div><img className="logo" src="/img/NNDS.png" alt="Logo" /></div>
            </header>
            <nav id="sticky" className="navbar navbar-expand-lg fixed-top" style={{ padding: 0, marginBottom: 0, marginLeft: '0.5rem', marginTop: '2.8rem' }}>

                <button className="navbar-toggler navbar-dark" type="button" data-bs-toggle="collapse" data-bs-target="#nav">
                    <span className="navbar-toggler-icon"></span>
                </button>


                <div className="navbar-collapse collapse" id="nav">
                    <ul className="navbar-nav " style={{ padding: 0 }}>
                        <li className="nav-item pp d-lg-block d-none"><a style={{ margin: 0, padding: 0, marginLeft: '-0.5rem' }} className="nav-link" href=""><div style={{ width: '10rem', height: 'auto', position: 'relative' }}><img style={{ position: 'absolute', transform: 'translate(2px,-30%)' }} className="logo" src="/img/NNDS.png" alt="Logo" /></div></a></li>
                        <li className="nav-item po"><a className="nav-link text-white text-uppercase" href="/">Trang chủ</a></li>
                        <li className="nav-item po"><a className="nav-link text-white text-uppercase" href="/#intro">Giới thiệu</a></li>
                        <li className="nav-item po"><a className="nav-link text-white text-uppercase" href="/#chuongtrinh">Chương trình</a></li>
                        <li className="nav-item po"><a className="nav-link text-white text-uppercase" href="/#footer">Liên hệ</a></li>
                    </ul>
                </div>
            </nav>

        </>
    )
}