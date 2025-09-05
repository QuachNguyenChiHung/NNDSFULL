import { DataSource } from "typeorm";
import express from 'express';
import cors from 'cors';
import url from 'node:url'
import path, { join } from "node:path";
import cloudinary from 'cloudinary'

import env from 'dotenv'

env.config()
import cookieParser from 'cookie-parser'
import createUserRouter from './controller/UserController.js';
import createBlogRouter from "./controller/BlogController.js";
import createOTPRouter from "./controller/OTPController.js";
cloudinary.v2.config({
    cloud_name: process.env.CLOUDNAME, // replace with your Cloudinary cloud name
    api_key: process.env.APIKEY,       // replace with your Cloudinary API key
    api_secret: process.env.SECRET // replace with your Cloudinary API secret

})


const app = express();

// Add UTF-8 encoding support for Vietnamese characters
app.use(express.json({ charset: 'utf-8' }));
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }));

app.use(cookieParser(process.env.COOKIE_KEY))
app.use(cors({ credentials: true, origin: 'http://localhost:5173' }))
const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const AppDataSource = new DataSource({
    username: 'SA',
    password: '12345',
    type: 'mssql',
    database: 'NNDS',

    synchronize: true,
    entities: [join(__dirname, 'entities', '*.js')],
    options: {
        encrypt: true,
        trustServerCertificate: true
    },
    port: 1433,
    host: 'localhost'
});
(
    async () => {
        try {
            console.log('yes')
            await AppDataSource.initialize()



            app.use('/api', createUserRouter());
            app.use('/api', createBlogRouter());
            app.use('/api', createOTPRouter());
        } catch (e) {
            console.log(e)
            await AppDataSource.destroy()
        }

    }
)();
app.listen(3000, () => {
    console.log('running at 3000')
});
export default AppDataSource;