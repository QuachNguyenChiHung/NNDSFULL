import { Router } from 'express';
import AppDataSource from '../index.js';
import OTP from '../entities/OTP.js';
import dotenv from 'dotenv'
import axios from 'axios';
import { verifyCookie } from './UserController.js';
dotenv.config()
function createOTPRouter() {
    const router = Router();
    const repo = AppDataSource.getRepository(OTP);
    function generateOTP() {
        return Math.floor(100000 + Math.random() * 900000);
    }
    // Create OTP
    router.post('/otps', verifyCookie, async (req, res) => {
        try {
            req.body.otp_code = generateOTP()
            if (!req.user.id) return res.status(400).json({ message: 'user id is required' });
            const entity = repo.create({ u_id: req.user.id, otp_code: req.body.otp_code });
            const saved = await repo.save(entity);
            if (saved) {
                try {
                    await axios.post(`${process.env.BREVO_LINK}`, {
                        sender: {
                            name: `Xin chào ${req.user.mail}`,
                            email: "datsanforeignlanguagecenter@gmail.com"
                        },
                        to: [
                            {
                                "email": req.user.mail
                            }

                        ],
                        subject: "Gửi mã OTP",
                        htmlContent: `
                                        <!DOCTYPE html>
                                        <html lang="vi">
                                        <head>
                                            <meta charset="UTF-8" />
                                            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                                            <title>Tạo tài khoản thành công</title>
                                        </head>
                                        <body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#333;">
                                            <h2>Mã OTP của bạn: ${req.body.otp_code}</h2>
                                            <h2>Xin cảm ơn</h2>
                                        </body>
                                        </html>
                                        `
                    }, {
                        headers: {
                            "api-key": process.env.BREVO_APIKEY
                        }
                    })
                    return res.status(201).json(saved);
                } catch (error) {
                    console.log(error)
                    return res.status(500).json({ message: 'Failed to send OTP via mail', error: error.message })
                }
            }

        } catch (err) {
            return res.status(500).json({ message: 'Failed to create OTP', error: err.message });
        }
    });

    // List OTPs (optional basic filtering by u_id)
    router.get('/otps', async (req, res) => {
        try {
            const { u_id } = req.query || {};
            const where = u_id ? { where: { u_id } } : {};
            const list = await repo.find(where);
            return res.json(list);
        } catch (err) {
            return res.status(500).json({ message: 'Failed to fetch OTPs', error: err.message });
        }
    });

    // Get OTP by id
    router.get('/otps/:id', async (req, res) => {
        try {
            const item = await repo.findOne({ where: { id: req.params.id } });
            if (!item) return res.status(404).json({ message: 'OTP not found' });
            return res.json(item);
        } catch (err) {
            return res.status(500).json({ message: 'Failed to fetch OTP', error: err.message });
        }
    });
    //Get latest OTP from cookie
    router.post('/otp/latest/me/', verifyCookie, async (req, res) => {
        try {
            const { otp_code } = req.body
            const items = await repo.find({ where: { u_id: req.user.id, otp_code: otp_code }, order: { created_at: 'DESC' } });

            if (!items || (items && items.length === 0)) return res.status(404).json({ message: 'The OTP does not exist' });
            const lastestOtp = items[0]
            const otplifetime = new Date(lastestOtp.created_at).getTime() + 1000 * 60 * 2
            const current = Date.now()
            if (otplifetime >= current)
                return res.status(200).json({
                    message: 'The OTP is valid',
                    success: true
                })
            else return res.status(400).json({
                message: 'The OTP is expired or invalid',
                success: false
            })
        } catch (err) {
            return res.status(500).json({ message: 'Failed to fetch OTP', error: err.message });
        }
    });

    // Update OTP by id
    router.put('/otps/:id', async (req, res) => {
        try {
            const item = await repo.findOne({ where: { id: req.params.id } });
            if (!item) return res.status(404).json({ message: 'OTP not found' });
            const allowed = ['u_id', 'otp_code'];
            for (const k of allowed) if (k in req.body) item[k] = req.body[k];
            const saved = await repo.save(item);
            return res.json(saved);
        } catch (err) {
            return res.status(500).json({ message: 'Failed to update OTP', error: err.message });
        }
    });

    // Delete OTP by id
    router.delete('/otps/:id', async (req, res) => {
        try {
            const result = await repo.delete(req.params.id);
            if (!result.affected) return res.status(404).json({ message: 'OTP not found' });
            return res.status(204).send();
        } catch (err) {
            return res.status(500).json({ message: 'Failed to delete OTP', error: err.message });
        }
    });

    return router;
}

export default createOTPRouter;
