
export function Footer() {
    return (
        <>
            <footer id="footer" style={{ marginTop: '3rem' }}>
                <div className="d-flex justify-content-evenly align-items-center flex-lg-row flex-column">

                    <div className="items">
                        <h2 className="text-sm-start text-center" style={{ textTransform: 'uppercase' }}>ngoại ngữ đạt san</h2>
                        <div className="d-sm-block d-none"><img src="/img/call.png" alt="" /><p>Số Điện Thoại:&nbsp;</p><a href="tel:0903708700"> 0903708700</a></div>
                        <div className="d-sm-block d-none"><img src="/img/faceboo.png" alt="" /><p>Trang Facebook:&nbsp;</p><a href="https://www.facebook.com/people/NGO%E1%BA%A0I-NG%E1%BB%AE-%C4%90%E1%BA%A0T-SAN/61572681046117/"> https://www.facebook.com/people/NGO%E1%BA%A0I-NG%E1%BB%AE-%C4%90%E1%BA%A0T-SAN/61572681046117/</a></div>
                        <div className="d-sm-block d-none"><img src="/img/zalo.png" alt="" /><p>Liên hệ qua zalo:&nbsp;</p><a href="https://zalo.me/0903708700">https://zalo.me/0903708700</a></div>
                        <div className="">Địa chỉ: 12 Đường 102, Phường Tăng Nhơn Phú A, Quận 9, Thành phố Hồ Chí Minh</div>
                    </div>
                    <div className="line"></div>
                    <div className="contact-bar d-flex d-sm-none">
                        <div style={{ marginLeft: '1rem' }} className="d-sm-none d-block"><a href="tel:0903708700"><img src="img/call.png" alt="" /></a></div>
                        <div className="d-sm-none d-block"><a href="https://www.facebook.com/people/NGO%E1%BA%A0I-NG%E1%BB%AE-%C4%90%E1%BA%A0T-SAN/61572681046117/"><img src="img/faceboo.png" alt="" /></a></div>
                        <div className="d-sm-none d-block"><a href="https://zalo.me/0903708700"><img style={{ width: '2.4rem' }} src="img/zalo.png" alt="" /></a></div>
                    </div>
                    <div><img src="/img/NNDS.png" alt="" className="logo" /></div>
                </div>
            </footer>
        </>
    )
}