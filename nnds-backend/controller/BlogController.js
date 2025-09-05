import { Router } from 'express';
import AppDataSource from '../index.js';
import Blog from '../entities/Blog.js';
import { verifyCookie } from './UserController.js';
import multer from 'multer';
import cloudinary from 'cloudinary'
// Configure multer for file uploads (memory storage)
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
function createBlogRouter() {

    const router = Router();
    const repo = AppDataSource.getRepository(Blog);

    // Returns up to 6 blogs with category 'study', including author info
    function getStudyBlogs(blogs) {
        const k = blogs
            .filter(blog => blog.category === 'study')
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 6);
        return k
    }

    // Returns up to 6 blogs with category 'news', including author info
    function getNewsBlogs(blogs) {
        return blogs
            .filter(blog => blog.category === 'news')
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 6);
    }
    // List blogs logic separated for reusability
    async function listBlogs() {
        try {
            // Load user relation for author info
            const blogs = await repo.find({ relations: ['user'] });
            const p = blogs.map(blog => {
                const { user, ...rest } = blog;
                return {
                    ...rest,
                    author: user ? {
                        id: user.id,
                        name: user.name
                    } : undefined
                };
            })
            return { data: p };
        } catch (err) {
            console.log(err)
            return { error: { status: 500, message: 'Failed to fetch blogs' } };
        }
    }

    router.get('/blogs', async (req, res) => {
        const result = await listBlogs();
        if (result.error) {
            return res.status(result.error.status).json({ message: result.error.message });
        }
        res.json(result.data);
    });
    router.get('/blogs/news', async (req, res) => {
        const result = await listBlogs();
        if (result.error) {
            return res.status(result.error.status).json({ message: result.error.message });
        }
        const filtered = getNewsBlogs(result.data);
        res.status(200).json(filtered);
    });

    router.get('/blogs/study', async (req, res) => {
        const result = await listBlogs();
        if (result.error) {
            return res.status(result.error.status).json({ message: result.error.message });
        }
        const filtered = getStudyBlogs(result.data);
        res.status(200).json(filtered);
    });
    async function getAuthorBlogs(u_id) {
        console.log('Getting author blogs for user ID:', u_id);
        const result = await listBlogs();
        if (result.error) {
            console.log('Error getting all blogs:', result.error);
            return [];
        }
        console.log('Total blogs found:', result.data.length);
        const filteredBlogs = result.data.filter(item => {
            const hasAuthor = item.author && item.author.id;
            const matches = hasAuthor && item.author.id == u_id;
            console.log(`Blog ID ${item.id}: author ID ${item.author?.id}, matches: ${matches}`);
            return matches;
        });
        console.log('Filtered blogs for user:', filteredBlogs.length);
        return filteredBlogs;
    }
    router.get('/blogs/me', verifyCookie, async (req, res) => {
        try {
            console.log('Received request for /blogs/me');
            console.log('req.user:', req.user);
            const u_id = req.user.id;
            console.log('User ID:', u_id);
            const authorblogs = await getAuthorBlogs(u_id);
            console.log('Returning blogs:', authorblogs.length);
            return res.status(200).json({ authorblogs });
        } catch (error) {
            console.log('Error in /blogs/me:', error);
            return res.status(401).json({ message: error?.message || error });
        }
    })
    // Get blog by id logic separated for reusability
    async function getBlogById(id) {
        try {
            const blog = await repo.findOne({ where: { id } });
            if (!blog) return { error: { status: 404, message: 'Blog not found' } };
            return { data: blog };
        } catch (err) {
            return { error: { status: 500, message: 'Failed to fetch blog' } };
        }
    }

    router.get('/blogs/:id', async (req, res) => {
        const result = await getBlogById(req.params.id);
        if (result.error) {
            return res.status(result.error.status).json({ message: result.error.message });
        }
        res.status(200).json(result.data);
    });

    // Create blog logic separated for reusability
    async function createBlog(blogData, u_id) {
        try {
            blogData.u_id = u_id
            const entity = repo.create(blogData);
            const saved = await repo.save(entity);
            return { data: saved };
        } catch (err) {
            return { error: { status: 500, message: 'Failed to create blog' } };
        }
    }

    router.post('/create-blog', upload.any(), verifyCookie, async (req, res) => {
        const id = req.user.id
        if (req.files) {
            const blogcontent_file = req.files.filter((item) => { return item.fieldname.startsWith('blog') })
            for (const fileitem of req.files) {
                if (fileitem.fieldname.startsWith("thumbnail")) {
                    const data = await uploadImgToCloudinary(fileitem.buffer)
                    req.body.thumbnail.link = data.secure_url
                    break;
                }
            }
            for (const element of blogcontent_file) {
                const blogcontentpos = Number.parseInt(
                    element.fieldname.replace('blog_content[', '').replace('][img][file]', '')
                );

                const data = await uploadImgToCloudinary(element.buffer);
                console.log(data);
                req.body.blog_content[blogcontentpos].img.link = data.secure_url;

                console.log(req.body.blog_content[blogcontentpos].img);
            }

        }

        const result = await createBlog(req.body, id);
        if (result.error) {
            return res.status(result.error.status).json({ message: result.error.message });
        }

        // Set proper charset for Vietnamese characters
        res.set('Content-Type', 'application/json; charset=utf-8');
        res.status(201).json(result.data);
    });

    // Update blog logic separated for reusability
    async function updateBlogById(id, updateData, files) {//delete files
        try {

            const blog = await repo.findOne({ where: { id } });
            if (!blog) return { error: { status: 404, message: 'Blog not found' } };

            if (files) {
                for (const fileitem of files) {
                    if (fileitem.fieldname.startsWith("thumbnail")) {
                        const filebuffer = fileitem.buffer

                        const blogthumbnail = blog.thumbnail
                        if (blogthumbnail.link) {
                            await deleteBlogImgByLink(blogthumbnail.link)
                        }
                        //original data
                        const upload = await uploadImgToCloudinary(filebuffer)
                        if (upload) {
                            updateData.thumbnail.link = upload.secure_url
                            console.log(updateData.thumbnail.link)
                        }
                    }
                    else if (fileitem.fieldname.startsWith("blog_content")) {
                        const blogcontentpos = Number.parseInt(
                            fileitem.fieldname.replace('blog_content[', '').replace('][img][file]', '')
                        );
                        console.log(blogcontentpos)
                        const filebuffer = fileitem.buffer
                        console.log(blog)
                        const blogContent = blog.blog_content[blogcontentpos]

                        const blogContentImg = blogContent.img
                        if (blogContentImg.link) {
                            await deleteBlogImgByLink(blogContentImg.link)
                        }


                        const upload = await uploadImgToCloudinary(filebuffer)
                        if (upload) {
                            updateData.blog_content[blogcontentpos].img.link = upload.secure_url
                            console.log(updateData.blog_content[blogcontentpos].img.link)
                        }
                    }
                }
            }

            Object.assign(blog, updateData);
            const saved = await repo.save(blog);
            return { data: saved };
        } catch (err) {
            return { error: { status: 500, message: 'Failed to update blog' } };
        }
    }

    router.put('/blogs/:id', upload.any(), verifyCookie, async (req, res) => {
        const id = req.params.id;

        // Ensure proper UTF-8 encoding for Vietnamese characters
        if (req.body) {
            // Recursively ensure all string fields are properly decoded
            const decodeObject = (obj) => {
                if (typeof obj === 'string') {
                    return obj;
                }
                if (Array.isArray(obj)) {
                    return obj.map(decodeObject);
                }
                if (obj && typeof obj === 'object') {
                    const decoded = {};
                    for (const [key, value] of Object.entries(obj)) {
                        decoded[key] = decodeObject(value);
                    }
                    return decoded;
                }
                return obj;
            };

            req.body = decodeObject(req.body);
        }

        const result = await updateBlogById(id, req.body, req.files);
        if (result.error) {
            return res.status(result.error.status).json({ message: result.error.message });
        }

        // Set proper charset for Vietnamese characters
        res.set('Content-Type', 'application/json; charset=utf-8');
        res.json(result.data);
    });

    // Delete blog logic separated for reusability
    async function deleteBlogById(id) {
        try {
            const post = await repo.findOne({
                where: {
                    id: id
                }
            })
            if (!post) return { error: { status: 404, message: 'Blog not found' } }
            const thumbnaillink = post.thumbnail.link
            deleteBlogImgByLink(thumbnaillink)
            const blog_content = post.blog_content
            for (const content of blog_content) {
                deleteBlogImgByLink(content.img.link)
            }
            await repo.delete(id);
            return { message: 'Sucessfully deleted blog' };
        } catch (err) {
            return { error: { status: 500, message: 'Failed to delete blog' } };
        }
    }

    router.delete('/blogs/:id', async (req, res) => {
        const result = await deleteBlogById(req.params.id);
        if (result.error) {
            return res.status(result.error.status).json({ message: result.error.message });
        }
        return res.status(204).json({ message: result.message });
    });

    return router;
}
async function uploadImgToCloudinary(fileBuffer) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream(
            { unique_filename: true },
            (err, result) => {
                if (err) return reject(err);
                resolve(result);
            }
        );
        stream.end(fileBuffer);
    });
}
async function deleteBlogImgByLink(p_link) {
    try {
        if (!p_link && !p_link.search('res.cloudinary.com')) {
            console.log('The link is invalid');
            return null;
        }

        // Tách public_id từ link
        const parts = p_link.split('/');
        const filename = parts.pop(); // "bulqzz9mciqtolneycp2.jpg"
        const publicId = filename.split('.')[0]; // "bulqzz9mciqtolneycp2"

        // Xóa trên Cloudinary (nên await để chắc chắn xóa xong)
        const result = await cloudinary.v2.uploader.destroy(publicId);
        console.log('Cloudinary delete result:', result);

        return result;
    } catch (error) {
        console.error('Failed to delete Cloudinary image', error);
        return null;
    }
}

export default createBlogRouter;
export { deleteBlogImgByLink, uploadImgToCloudinary };
