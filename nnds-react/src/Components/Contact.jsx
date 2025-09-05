export function Contact() {
    return (
        <div className="contact">
            <div style={{ marginTop: '0.5rem' }}>
                <div className="call" >
                    <a href="tel:0903708700"><img src="img/contact-ico/call-icon.png" alt="Call icon" /></a>
                </div>
                <span style={{ marginLeft: '10px' }} className="bubble">Hotline</span>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
                <div className="sms"><a href="sms:0903708700"><img src="img/contact-ico/sms-icon.png" alt="SMS icon" /></a></div>
                <span style={{ marginLeft: '10px' }} className="bubble">Gửi SMS</span>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
                <div className="zalo"><a href="https://zalo.me/0903708700"><img src="img/contact-ico/zalo.png" alt="Zalo icon" /></a></div>
                <span style={{ marginLeft: '10px' }} className="bubble">Chat Zalo</span>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
                <div className="messenger"><a href="https://www.facebook.com/profile.php?id=61572681046117"><img src="img/contact-ico/mess.png" alt="Messenger icon" /></a></div>
                <span style={{ marginLeft: '10px' }} className="bubble">Facebook</span>
            </div>
        </div>
    )
}