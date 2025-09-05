import { Router } from 'express';
import AppDataSource from '../index.js';
import User from '../entities/User.js';
import jwt from 'jsonwebtoken'
import multer from 'multer';
import bcrypt from 'bcrypt';
import createBlogRouter, { deleteBlogImgByLink, uploadImgToCloudinary } from './BlogController.js';
import axios from 'axios';
import env from 'dotenv'

env.config()
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Only allow image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});
export async function verifyCookie(req, res, next) {
    try {
        console.log('Signed Cookies:', req.signedCookies);

        const token = req.signedCookies.ndj;
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET);
        const user = await AppDataSource.getRepository(User).findOne({ where: { id: decode.u_id } });

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized users are not allowed!!' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log('verifyCookie error:', error);
        return res.status(500).json({ message: 'Token verification failed', error: error.message });
    }
}

function createUserRouter() {
    const router = Router();
    const repo = AppDataSource.getRepository(User);

    // Login logic separated for reusability
    async function loginUser(mail, password) {
        try {

            const user = await repo.findOne({
                where: {
                    mail: mail,
                    password: password
                }
            });
            if (!user) return { error: { status: 404, message: 'mail or password is invalid' } };
            const token = jwt.sign({
                u_id: user.id,
                u_mail: user.mail,
                u_role: user.role || 'teacher'
            }, process.env.JWT_SECRET, { expiresIn: '2h' })
            return {
                data: {
                    message: 'success',
                    u_id: user.id,
                    u_mail: user.mail,
                },
                token: token
            };
        } catch (e) {
            return {
                error: {
                    status: 500, message: e.message

                }
            };
        }
    }
    router.post('/signout', verifyCookie, (req, res) => {
        const cookies = req.signedCookies.ndj
        if (cookies) {
            console.log(cookies)
            return res.status(201).clearCookie('ndj', {
                sameSite: 'lax',
                httpOnly: true,
                secure: false,
                signed: true
            }).json({
                message: 'Bạn đã đăng xuất ra khỏi website'
            })
        }
        return res.status(404).json({
            message: 'Session không hợp lệ !'
        })
    })
    router.post('/login', async (req, res) => {
        const { mail, password } = req.body;
        //  const result = await loginUser(mail, bcrypt.hash(password, 10));
        const result = await loginUser(mail, password);
        if (result.error) {
            return res.status(result.error.status).json({ message: result.error.message });
        }
        return res.status(200).cookie('ndj', result.token, {
            maxAge: 1000 * 3600 * 2,
            sameSite: 'lax',
            httpOnly: true,
            secure: false,
            signed: true
        }).json(result.data);
    });

    // List users logic separated for reusability
    async function listUsers() {
        try {
            const users = await repo.find();
            return { data: users };
        } catch (err) {
            return { error: { status: 500, message: 'Failed to fetch users' } };
        }
    }

    router.get('/users', verifyCookie, async (req, res) => {
        const result = await listUsers();
        if (result.error) {
            return res.status(result.error.status).json({ message: result.error.message });
        }
        res.json(result.data);
    });
    router.get('/user/me', verifyCookie, async (req, res) => {
        const user = req.user
        if (user) {
            return res.status(200).json({
                user
            })
        }
        return res.status(user.status).json({
            message: user.message
        })
    })
    // Get user by id logic separated for reusability
    async function getUserById(id) {
        try {
            const user = await repo.findOne({ where: { id } });
            if (!user) return { error: { status: 404, message: 'User not found' } };
            return { data: user };
        } catch (err) {
            return { error: { status: 500, message: 'Failed to fetch user' } };
        }
    }

    router.get('/users/:id', async (req, res) => {
        const result = await getUserById(req.params.id);
        if (result.error) {
            return res.status(result.error.status).json({ message: result.error.message });
        }
        res.json(result.data);
    });

    // Create user logic separated for reusability
    async function createUser(userData) {
        // userData.password = bcrypt.hash(userData.password, 10)
        const { mail, role, password } = userData || {};
        if (!mail || !role || !password) return { error: { status: 400, message: 'mail and role and password are required' } };
        if (!['teacher', 'admin'].includes(role)) return { error: { status: 400, message: 'role must be teacher or admin' } };
        try {
            const entity = repo.create(userData);
            const saved = await repo.save(entity);
            return { data: saved };
        } catch (err) {
            const code = err?.driverError?.number;
            if (code === 2627 || code === 2601) return { error: { status: 409, message: 'Email already exists' } };
            return { error: { status: 500, message: 'Failed to create user' } };
        }
    }
    function generateStrongPassword(length = 10) {
        const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lower = "abcdefghijklmnopqrstuvwxyz";
        const numbers = "0123456789";
        const specials = "!@#$%^&*()_+[]{}|;:,.<>?";

        const all = upper + lower + numbers + specials;

        // Ensure at least one of each
        let password = "";
        password += upper[Math.floor(Math.random() * upper.length)];
        password += lower[Math.floor(Math.random() * lower.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += specials[Math.floor(Math.random() * specials.length)];

        // Fill the rest
        for (let i = password.length; i < length; i++) {
            password += all[Math.floor(Math.random() * all.length)];
        }

        // Shuffle the characters so it's not predictable
        return password.split('').sort(() => 0.5 - Math.random()).join('');
    }
    router.post('/create-user', async (req, res) => {
        req.body.password = generateStrongPassword(10)
        console.log(process.env.BREVO_APIKEY)
        const result = await createUser(req.body);
        if (result.error) {
            return res.status(result.error.status).json({ message: result.error.message });
        }
        //send msg
        try {
            const resMail = await axios.post('https://api.brevo.com/v3/smtp/email',
                {

                    sender: {
                        name: `Xin chào ${req.body.mail}`,
                        email: "datsanforeignlanguagecenter@gmail.com"
                    },
                    to: [
                        {
                            "email": req.body.mail
                        }

                    ],
                    subject: "Test",
                    htmlContent: `
                                        <!DOCTYPE html>
                                        <html lang="vi">
                                        <head>
                                            <meta charset="UTF-8" />
                                            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                                            <title>Tạo tài khoản thành công</title>
                                        </head>
                                        <body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#333;">
                                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f4f5f7;padding:24px 0;">
                                                <tr>
                                                    <td align="center">
                                                        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
                                                            <tr>
                                                                <td style="background:#7e4cde;color:#ffffff;padding:24px;text-align:center;">
                                                                    <h1 style="margin:0;font-size:22px;line-height:1.3;">Tài khoản của bạn đã được tạo</h1>
                                                                    <p style="margin:8px 0 0 0;font-size:14px;opacity:.9;">Chào mừng bạn đến với NNDS</p>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style="padding:24px 24px 8px 24px;">
                                                                    <p style="margin:0 0 12px 0;font-size:15px;line-height:1.6;">
                                                                        Xin chào, tài khoản của bạn đã được tạo thành công. Vui lòng dùng thông tin bên dưới để đăng nhập.
                                                                    </p>
                                                                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:12px 0 0 0;">
                                                                        <tr>
                                                                            <td style="padding:12px;border:1px solid #e5e7eb;border-radius:8px;background:#fafafa;">
                                                                                <p style="margin:0 0 6px 0;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:.5px;">Email</p>
                                                                                <p style="margin:0;font-size:16px;font-weight:600;color:#111;">${req.body.mail}</p>
                                                                            </td>
                                                                        </tr>
                                                                        <tr><td style="height:8px;"></td></tr>
                                                                        <tr>
                                                                            <td style="padding:12px;border:1px solid #e5e7eb;border-radius:8px;background:#fafafa;">
                                                                                <p style="margin:0 0 6px 0;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:.5px;">Mật khẩu</p>
                                                                                <p style="margin:0;font-size:16px;font-weight:600;color:#111;">${req.body.password}</p>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                    <div style="text-align:center;margin:20px 0 0 0;">
                                                                        <a href="#" style="display:inline-block;background:#7e4cde;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;">
                                                                            Đăng nhập ngay
                                                                        </a>
                                                                    </div>
                                                                    <p style="margin:16px 0 0 0;font-size:13px;color:#666;line-height:1.6;">
                                                                        Lưu ý: Đây là email tự động, vui lòng không trả lời. Nếu bạn không yêu cầu tạo tài khoản, hãy liên hệ quản trị viên.
                                                                    </p>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style="padding:16px 24px;background:#f9fafb;color:#6b7280;font-size:12px;text-align:center;">
                                                                    © ${new Date().getFullYear()} NNDS. Mọi quyền được bảo lưu.
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </body>
                                        </html>
                                        `
                },
                {
                    headers: {
                        "api-key": process.env.BREVO_APIKEY
                    }
                }
            );
            return res.status(201).json(result.data);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }

    });

    // Update user logic separated for reusability
    async function updateUserById(id, updateData, imgfile = null) {
        const user = await repo.findOne({ where: { id } });
        if (!user) return { error: { status: 404, message: 'User not found' } };
        const allowed = ['name', 'mail', 'phone_number', 'bio_json', 'first_time', 'verified', 'date_of_birth'];
        for (const key of allowed) if (key in updateData) user[key] = updateData[key];
        if (user.role && !['teacher', 'admin'].includes(user.role)) {
            return { error: { status: 400, message: 'role must be teacher or admin' } };
        }
        if (imgfile) {
            const imglink = user.img_link
            deleteBlogImgByLink(imglink)
            const fileresult = await uploadImgToCloudinary(imgfile.buffer)
            user.img_link = fileresult.secure_url
        }

        try {
            const saved = await repo.save(user);
            return { data: saved };
        } catch (err) {
            const code = err?.driverError?.number;
            if (code === 2627 || code === 2601) {
                return { error: { status: 409, message: 'Email already exists' } };
            }
            return { error: { status: 500, message: 'Failed to update user' } };
        }
    }

    router.put('/users/:id', verifyCookie, async (req, res) => {
        const id = req.params.id;
        const result = await updateUserById(id, req.body, null);
        if (result.error) {
            return res.status(result.error.status).json({ message: result.error.message });
        }
        res.status(200).json(result.data);
    });
    router.put('/user/me', verifyCookie, upload.any(), async (req, res) => {
        const id = req.user.id;
        const file = Array.isArray(req.files) && req.files.length > 0 ? req.files[0] : null;
        const result = await updateUserById(id, req.body, file);
        if (result.error) {
            return res.status(result.error.status).json({ message: result.error.message });
        }
        res.status(200).json(result.data);
    });
    // Delete user logic separated for reusability
    async function deleteUserById(id) {
        try {
            const result = await repo.delete(id);
            if (!result.affected) return { error: { status: 404, message: 'User not found' } };
            return { data: null };
        } catch (err) {
            return { error: { status: 500, message: 'Failed to delete user' } };
        }
    }

    router.delete('/users/:id', async (req, res) => {
        const result = await deleteUserById(req.params.id);
        if (result.error) {
            return res.status(result.error.status).json({ message: result.error.message });
        }
        res.status(204).send();
    });

    return router;
}

export default createUserRouter;
