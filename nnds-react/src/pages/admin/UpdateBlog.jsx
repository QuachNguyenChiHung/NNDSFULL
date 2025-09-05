import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const UpdateBlog = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [blogData, setBlogData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [isFormValid, setIsFormValid] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    // Validation constants
    const MAX_TITLE_LENGTH = 100;
    const MIN_TITLE_LENGTH = 5;
    const MAX_INTRO_LENGTH = 500;
    const MAX_SECTION_HEADING_LENGTH = 50;
    const MAX_SECTION_PARAGRAPH_LENGTH = 2000;
    const MAX_SECTIONS = 10;
    const INTRO_WARNING_THRESHOLD = MAX_INTRO_LENGTH * 0.8;

    const [formData, setFormData] = useState({
        blog_title: '',
        introduction: '',
        category: 'news',
        thumbnail: {
            link: '',
            alt: '',
            file: null,
            message: ''
        },
        blog_content: []
    });

    // Toast functionality
    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 5000);
    };

    // Validation functions
    const validateForm = () => {
        const newErrors = {};

        // Validate title
        if (!formData.blog_title) {
            newErrors.blog_title = 'Title is required';
        } else if (formData.blog_title.length < MIN_TITLE_LENGTH) {
            newErrors.blog_title = `Title must be at least ${MIN_TITLE_LENGTH} characters`;
        } else if (formData.blog_title.length > MAX_TITLE_LENGTH) {
            newErrors.blog_title = `Title cannot exceed ${MAX_TITLE_LENGTH} characters`;
        }

        // Validate introduction
        if (!formData.introduction) {
            newErrors.introduction = 'Introduction is required';
        } else if (formData.introduction.length > MAX_INTRO_LENGTH) {
            newErrors.introduction = `Introduction cannot exceed ${MAX_INTRO_LENGTH} characters`;
        }

        // Validate thumbnail
        if (formData.thumbnail.link || formData.thumbnail.file) {
            if (!formData.thumbnail.alt) {
                newErrors.thumbnail_alt = 'Alt text is required for thumbnail';
            }

            if (formData.thumbnail.link && !isValidImageUrl(formData.thumbnail.link)) {
                newErrors.thumbnail_link = 'URL must be a valid image URL (https:// with .jpg, .png, etc.)';
            }
        }

        // Validate content sections (if any)
        if (formData.blog_content.length > MAX_SECTIONS) {
            newErrors.blog_content = `Cannot exceed ${MAX_SECTIONS} sections`;
        }

        formData.blog_content.forEach((section, index) => {
            // Only validate non-empty sections
            if (section.heading || section.paragraph || section.img.link || section.img.file || section.youtube) {
                if (!section.heading) {
                    newErrors[`section_${index}_heading`] = 'Section heading is required';
                } else if (section.heading.length > MAX_SECTION_HEADING_LENGTH) {
                    newErrors[`section_${index}_heading`] = `Heading cannot exceed ${MAX_SECTION_HEADING_LENGTH} characters`;
                }

                if (!section.paragraph) {
                    newErrors[`section_${index}_paragraph`] = 'Section paragraph is required';
                } else if (section.paragraph.length > MAX_SECTION_PARAGRAPH_LENGTH) {
                    newErrors[`section_${index}_paragraph`] = `Paragraph cannot exceed ${MAX_SECTION_PARAGRAPH_LENGTH} characters`;
                }

                if (section.img.link || section.img.file) {
                    if (!section.img.alt) {
                        newErrors[`section_${index}_img_alt`] = 'Alt text is required for section image';
                    }

                    if (section.img.link && !isValidImageUrl(section.img.link)) {
                        newErrors[`section_${index}_img_link`] = 'URL must be a valid image URL';
                    }
                }

                if (section.youtube && !isValidYouTubeUrl(section.youtube)) {
                    newErrors[`section_${index}_youtube`] = 'Invalid YouTube URL format';
                }
            }
        });

        setErrors(newErrors);

        // Form is valid if we have title, intro, and category with no errors
        const isValid = formData.blog_title &&
            formData.introduction &&
            formData.category &&
            Object.keys(newErrors).length === 0;

        setIsFormValid(isValid);
        return isValid;
    };

    const isValidImageUrl = (url) => {
        try {
            const parsedUrl = new URL(url);
            if (!parsedUrl.protocol.startsWith('https')) return false;

            const path = parsedUrl.pathname.toLowerCase();
            return path.endsWith('.jpg') ||
                path.endsWith('.jpeg') ||
                path.endsWith('.png') ||
                path.endsWith('.webp') ||
                path.endsWith('.gif') ||
                path.endsWith('.svg');
        } catch (e) {
            return false;
        }
    };

    const isValidYouTubeUrl = (url) => {
        try {
            const parsedUrl = new URL(url);
            return (parsedUrl.hostname === 'www.youtube.com' ||
                parsedUrl.hostname === 'youtube.com') &&
                parsedUrl.searchParams.has('v');
        } catch (e) {
            return false;
        }
    };

    // Fetch user data
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user/me`, {
                    withCredentials: true
                });
                if (!res.data.user.verified) {
                    alert("Tài khoản cần phải được xác nhận trước khi truy cập")
                    navigate('/login/otp')
                    return
                }
                else if (res.data.user.first_time) {
                    alert("Tài khoản cần phải cài lại mật khẩu trước khi sử dụng")
                    navigate('/login/reset-password')
                    return
                } else if (!res.data.user.name) {
                    navigate('/login/setInfo')
                    return
                }
                setUser(res.data);
                console.log(res.data)
            } catch (error) {
                console.error('Failed to fetch user data:', error);
                showToast('Please log in to access this page', 'error');
                navigate('/login');
            }
        };
        fetchUser();
    }, [navigate]);

    // Fetch blog data
    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/blogs/${id}`);
                const blog = response.data;
                setBlogData(blog);

                // Populate form with existing blog data
                setFormData({
                    blog_title: blog.blog_title || '',
                    introduction: blog.introduction || '',
                    category: blog.category || 'news',
                    thumbnail: {
                        link: blog.thumbnail?.link || '',
                        alt: blog.thumbnail?.alt || '',
                        file: null,
                        message: ''
                    },
                    blog_content: blog.blog_content || []
                });
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch blog data:', error);
                showToast('Blog not found or error loading blog data', 'error');
                navigate('/admin/blogs');
            }
        };

        if (id) {
            fetchBlog();
        }
    }, [id, navigate]);

    // Validation useEffect
    useEffect(() => {
        validateForm();
    }, [formData]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user makes changes
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleThumbnailChange = (type, value) => {
        setFormData(prev => ({
            ...prev,
            thumbnail: {
                ...prev.thumbnail,
                [type]: value
            }
        }));

        // Clear error when user makes changes
        if (errors[`thumbnail_${type}`]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`thumbnail_${type}`];
                return newErrors;
            });
        }
    };

    const handleContentChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            blog_content: prev.blog_content.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));

        // Clear error when user makes changes
        const errorKey = `section_${index}_${field}`;
        if (errors[errorKey]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[errorKey];
                return newErrors;
            });
        }
    };

    const handleContentImgChange = (index, type, value) => {
        setFormData(prev => ({
            ...prev,
            blog_content: prev.blog_content.map((item, i) =>
                i === index ? {
                    ...item,
                    img: { ...item.img, [type]: value }
                } : item
            )
        }));

        // Clear error when user makes changes
        const errorKey = `section_${index}_img_${type}`;
        if (errors[errorKey]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[errorKey];
                return newErrors;
            });
        }
    };

    const addContentSection = () => {
        if (formData.blog_content.length < MAX_SECTIONS) {
            setFormData(prev => ({
                ...prev,
                blog_content: [
                    ...prev.blog_content,
                    {
                        heading: '',
                        paragraph: '',
                        img: { link: '', alt: '', file: null },
                        youtube: ''
                    }
                ]
            }));
        }
    };

    const removeContentSection = (index) => {
        setFormData(prev => ({
            ...prev,
            blog_content: prev.blog_content.filter((_, i) => i !== index)
        }));
    };

    if (loading) {
        return (
            <div className="container mt-4">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading blog data...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mt-4">
                <div className="alert alert-warning">
                    Please log in to update blogs.
                </div>
            </div>
        );
    }
    const appendFormData = (fd, data) => {
        // Ensure UTF-8 encoding for Vietnamese characters
        // top level
        fd.append("blog_title", data.blog_title || '');
        fd.append("introduction", data.introduction || '');
        fd.append("category", data.category || '');

        // thumbnail
        fd.append("thumbnail[link]", data.thumbnail.link || '');
        fd.append("thumbnail[alt]", data.thumbnail.alt || '');
        if (data.thumbnail.file) {
            fd.append("thumbnail[file]", data.thumbnail.file);
        }

        // blog_content (array)
        if (Array.isArray(data.blog_content)) {
            data.blog_content.forEach((section, i) => {
                fd.append(`blog_content[${i}][heading]`, section.heading || '');
                fd.append(`blog_content[${i}][paragraph]`, section.paragraph || '');

                fd.append(`blog_content[${i}][img][link]`, section.img.link || '');
                fd.append(`blog_content[${i}][img][alt]`, section.img.alt || '');
                if (section.img.file) {
                    fd.append(`blog_content[${i}][img][file]`, section.img.file);
                }

                fd.append(`blog_content[${i}][youtube]`, section.youtube || '');
            });
        }

        const handlesubmit = async (fd) => {
            setIsSubmitting(true);
            try {
                // Let the browser set the Content-Type automatically for FormData
                // This ensures proper boundary and encoding are set
                const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/blogs/${id}`, fd, {
                    withCredentials: true,
                    headers: {
                        // Remove Content-Type to let browser set it automatically with proper boundary
                        // 'Content-Type': 'multipart/form-data' // Don't set this manually
                    }
                });
                if (res.status === 200) {
                    showToast('Blog updated successfully!', 'success');
                    setTimeout(() => navigate('/admin/blogs'), 2000);
                } else {
                    showToast(`Failed to update blog (Status: ${res.status})`, 'error');
                }
            } catch (error) {
                console.log('Update error:', error);

                let errorMessage = 'Error updating blog: ';

                if (error.response) {
                    // Server responded with error status
                    const status = error.response.status;
                    const data = error.response.data;

                    switch (status) {
                        case 400:
                            errorMessage += `Invalid data - ${data?.message || 'Please check your input fields'}`;
                            break;
                        case 401:
                            errorMessage += 'You are not authorized. Please log in again.';
                            setTimeout(() => navigate('/login'), 2000);
                            break;
                        case 403:
                            errorMessage += 'You do not have permission to update this blog.';
                            break;
                        case 404:
                            errorMessage += 'Blog not found. It may have been deleted.';
                            setTimeout(() => navigate('/admin/blogs'), 2000);
                            break;
                        case 413:
                            errorMessage += 'File size too large. Please use smaller images.';
                            break;
                        case 415:
                            errorMessage += 'Unsupported file type. Please use jpg, png, or webp images.';
                            break;
                        case 422:
                            errorMessage += `Validation failed - ${data?.message || 'Please check your input'}`;
                            if (data?.errors) {
                                // If server returns specific field errors
                                const fieldErrors = Object.entries(data.errors).map(([field, msg]) => `${field}: ${msg}`).join(', ');
                                errorMessage += ` (${fieldErrors})`;
                            }
                            break;
                        case 500:
                            errorMessage += 'Server error. Please try again later.';
                            break;
                        default:
                            errorMessage += `Server error (${status}) - ${data?.message || error.message}`;
                    }
                } else if (error.request) {
                    // Network error
                    errorMessage += 'Network error. Please check your internet connection and try again.';
                } else {
                    // Other error
                    errorMessage += error.message || 'Unknown error occurred';
                }

                showToast(errorMessage, 'error');
            } finally {
                setIsSubmitting(false);
            }
        };

        handlesubmit(fd);
    };
    return (
        <div className="container mt-4">
            {/* Toast Notification */}
            {toast.show && (
                <div className={`alert alert-${toast.type === 'success' ? 'success' : toast.type === 'error' ? 'danger' : 'info'} alert-dismissible fade show position-fixed`}
                    style={{ top: '20px', right: '20px', zIndex: 1050, maxWidth: '400px' }}
                    role="alert">
                    {toast.message}
                    <button type="button" className="btn-close" onClick={() => setToast({ show: false, message: '', type: '' })}></button>
                </div>
            )}

            <div className="row">
                {/* Form Section */}
                <div className="col-lg-6">
                    <div className="card">
                        <div className="card-header">
                            <h3>Update Blog</h3>
                            <button onClick={() => console.log(formData)}>ssd</button>
                            <small className="text-muted">Logged in as: {user.user.name}</small>
                        </div>
                        <div className="card-body">
                            <form>
                                {/* Blog Title */}
                                <div className="mb-3">
                                    <label className="form-label">Blog Title <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.blog_title ? 'is-invalid' : ''}`}
                                        value={formData.blog_title}
                                        onChange={(e) => handleInputChange('blog_title', e.target.value)}
                                        placeholder={`Enter blog title (${MIN_TITLE_LENGTH}-${MAX_TITLE_LENGTH} characters)`}
                                        maxLength={MAX_TITLE_LENGTH}
                                    />
                                    {errors.blog_title && (
                                        <div className="invalid-feedback">{errors.blog_title}</div>
                                    )}
                                    <small className="form-text text-muted">
                                        {formData.blog_title.length}/{MAX_TITLE_LENGTH} characters
                                    </small>
                                </div>

                                {/* Introduction */}
                                <div className="mb-3">
                                    <label className="form-label">Introduction <span className="text-danger">*</span></label>
                                    <textarea
                                        className={`form-control ${errors.introduction ? 'is-invalid' : ''}`}
                                        rows="4"
                                        value={formData.introduction}
                                        onChange={(e) => handleInputChange('introduction', e.target.value)}
                                        placeholder={`Enter introduction (max ${MAX_INTRO_LENGTH} characters)`}
                                        maxLength={MAX_INTRO_LENGTH}
                                    />
                                    {errors.introduction && (
                                        <div className="invalid-feedback">{errors.introduction}</div>
                                    )}
                                    <small className={`form-text ${formData.introduction.length > INTRO_WARNING_THRESHOLD ? 'text-warning' : 'text-muted'}`}>
                                        {formData.introduction.length}/{MAX_INTRO_LENGTH} characters
                                        {formData.introduction.length > INTRO_WARNING_THRESHOLD && " (approaching limit)"}
                                    </small>
                                </div>

                                {/* Category */}
                                <div className="mb-3">
                                    <label className="form-label">Category</label>
                                    <select
                                        className="form-select"
                                        value={formData.category}
                                        onChange={(e) => handleInputChange('category', e.target.value)}
                                    >
                                        <option value="news">News</option>
                                        <option value="study">Study</option>
                                    </select>
                                </div>

                                {/* Thumbnail */}
                                <div className="mb-3">
                                    <label className="form-label">Thumbnail</label>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <label className="form-label">Image URL</label>
                                            <input
                                                type="url"
                                                className={`form-control ${errors.thumbnail_link ? 'is-invalid' : ''}`}
                                                disabled={!!formData.thumbnail.file}
                                                value={formData.thumbnail.link}
                                                onChange={(e) => {
                                                    const url = e.target.value;
                                                    handleThumbnailChange('link', url);

                                                    if (url && !isValidImageUrl(url)) {
                                                        setErrors(prev => ({
                                                            ...prev,
                                                            thumbnail_link: 'URL must be https:// and end with an image extension'
                                                        }));
                                                    }
                                                }}
                                                placeholder="https://example.com/image.jpg"
                                            />
                                            {errors.thumbnail_link && (
                                                <div className="invalid-feedback">{errors.thumbnail_link}</div>
                                            )}
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Upload File</label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                accept="image/*"
                                                disabled={!!formData.thumbnail.link}
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        // Check file size (2MB limit)
                                                        if (file.size > 2 * 1024 * 1024) {
                                                            showToast('File size cannot exceed 2MB', 'error');
                                                            return;
                                                        }
                                                        handleThumbnailChange('file', file);
                                                        handleThumbnailChange('link', '');
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <label className="form-label">Alt Text {(formData.thumbnail.link || formData.thumbnail.file) && <span className="text-danger">*</span>}</label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.thumbnail_alt ? 'is-invalid' : ''}`}
                                            value={formData.thumbnail.alt}
                                            onChange={(e) => handleThumbnailChange('alt', e.target.value)}
                                            placeholder="Image description"
                                        />
                                        {errors.thumbnail_alt && (
                                            <div className="invalid-feedback">{errors.thumbnail_alt}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Content Sections */}
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <label className="form-label">Content Sections (Optional)</label>
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-sm"
                                            onClick={addContentSection}
                                            disabled={formData.blog_content.length >= MAX_SECTIONS}
                                        >
                                            Add Section {formData.blog_content.length >= MAX_SECTIONS && '(Max Reached)'}
                                        </button>
                                    </div>

                                    {formData.blog_content.map((section, index) => (
                                        <div key={index} className="card mt-3">
                                            <div className="card-header d-flex justify-content-between">
                                                <span>Section {index + 1}</span>
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => removeContentSection(index)}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                            <div className="card-body">
                                                <div className="mb-3">
                                                    <label className="form-label">Heading <span className="text-danger">*</span></label>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${errors[`section_${index}_heading`] ? 'is-invalid' : ''}`}
                                                        value={section.heading}
                                                        onChange={(e) => handleContentChange(index, 'heading', e.target.value)}
                                                        placeholder={`Section heading (max ${MAX_SECTION_HEADING_LENGTH} characters)`}
                                                        maxLength={MAX_SECTION_HEADING_LENGTH}
                                                    />
                                                    {errors[`section_${index}_heading`] && (
                                                        <div className="invalid-feedback">{errors[`section_${index}_heading`]}</div>
                                                    )}
                                                    <small className="form-text text-muted">
                                                        {section.heading.length}/{MAX_SECTION_HEADING_LENGTH} characters
                                                    </small>
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Paragraph <span className="text-danger">*</span></label>
                                                    <textarea
                                                        className={`form-control ${errors[`section_${index}_paragraph`] ? 'is-invalid' : ''}`}
                                                        rows="3"
                                                        value={section.paragraph}
                                                        onChange={(e) => handleContentChange(index, 'paragraph', e.target.value)}
                                                        placeholder={`Section content (max ${MAX_SECTION_PARAGRAPH_LENGTH} characters)`}
                                                        maxLength={MAX_SECTION_PARAGRAPH_LENGTH}
                                                    />
                                                    {errors[`section_${index}_paragraph`] && (
                                                        <div className="invalid-feedback">{errors[`section_${index}_paragraph`]}</div>
                                                    )}
                                                    <small className="form-text text-muted">
                                                        {section.paragraph.length}/{MAX_SECTION_PARAGRAPH_LENGTH} characters
                                                    </small>
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <label className="form-label">Image URL</label>
                                                        <input
                                                            type="url"
                                                            className={`form-control ${errors[`section_${index}_img_link`] ? 'is-invalid' : ''}`}
                                                            disabled={!!section.img.file}
                                                            value={section.img.link}
                                                            onChange={(e) => {
                                                                const url = e.target.value;
                                                                handleContentImgChange(index, 'link', url);

                                                                if (url && !isValidImageUrl(url)) {
                                                                    setErrors(prev => ({
                                                                        ...prev,
                                                                        [`section_${index}_img_link`]: 'URL must be https:// and end with an image extension'
                                                                    }));
                                                                }
                                                            }}
                                                            placeholder="https://example.com/image.jpg"
                                                        />
                                                        {errors[`section_${index}_img_link`] && (
                                                            <div className="invalid-feedback">{errors[`section_${index}_img_link`]}</div>
                                                        )}
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Upload Image</label>
                                                        <input
                                                            type="file"
                                                            className="form-control"
                                                            accept="image/*"
                                                            disabled={!!section.img.link}
                                                            onChange={(e) => {
                                                                const file = e.target.files[0];
                                                                if (file) {
                                                                    if (file.size > 2 * 1024 * 1024) {
                                                                        showToast('File size cannot exceed 2MB', 'error');
                                                                        return;
                                                                    }
                                                                    handleContentImgChange(index, 'file', file);
                                                                    handleContentImgChange(index, 'link', '');
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mt-2">
                                                    <label className="form-label">Image Alt Text {(section.img.link || section.img.file) && <span className="text-danger">*</span>}</label>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${errors[`section_${index}_img_alt`] ? 'is-invalid' : ''}`}
                                                        value={section.img.alt}
                                                        onChange={(e) => handleContentImgChange(index, 'alt', e.target.value)}
                                                        placeholder="Image description"
                                                    />
                                                    {errors[`section_${index}_img_alt`] && (
                                                        <div className="invalid-feedback">{errors[`section_${index}_img_alt`]}</div>
                                                    )}
                                                </div>
                                                <div className="mt-2">
                                                    <label className="form-label">YouTube URL (optional)</label>
                                                    <input
                                                        type="url"
                                                        className={`form-control ${errors[`section_${index}_youtube`] ? 'is-invalid' : ''}`}
                                                        value={section.youtube}
                                                        onChange={(e) => {
                                                            const url = e.target.value;
                                                            handleContentChange(index, 'youtube', url);

                                                            if (url && !isValidYouTubeUrl(url)) {
                                                                setErrors(prev => ({
                                                                    ...prev,
                                                                    [`section_${index}_youtube`]: 'Must be a valid YouTube URL'
                                                                }));
                                                            }
                                                        }}
                                                        placeholder="https://www.youtube.com/watch?v=..."
                                                    />
                                                    {errors[`section_${index}_youtube`] && (
                                                        <div className="invalid-feedback">{errors[`section_${index}_youtube`]}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="d-flex gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => navigate('/admin/blogs')}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-success"
                                        onClick={() => {
                                            const isValid = validateForm();
                                            if (isValid && !isSubmitting) {
                                                appendFormData(new FormData(), formData);
                                            } else if (!isValid) {
                                                // Scroll to the first error
                                                const firstErrorKey = Object.keys(errors)[0];
                                                if (firstErrorKey) {
                                                    const errorElement = document.querySelector(`.is-invalid`);
                                                    errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                }
                                            }
                                        }}
                                        disabled={!isFormValid || isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Updating...
                                            </>
                                        ) : (
                                            'Update Blog'
                                        )}
                                    </button>
                                </div>

                                {!isFormValid && Object.keys(errors).length > 0 && (
                                    <div className="alert alert-warning mt-3">
                                        Please fix the validation errors before submitting.
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>

                {/* Preview Section */}
                <div className="col-lg-6">
                    <div className="card">
                        <div className="card-header">
                            <h3>Preview</h3>
                        </div>
                        <div className="card-body">
                            <div className="mb-4">
                                <h1 className="fw-bolder text-center" style={{
                                    fontFamily: "Roboto, sans-serif",
                                    color: "#7e4cde",
                                    textTransform: "uppercase",
                                }}>
                                    {formData.blog_title || 'Blog Title'}
                                </h1>
                            </div>

                            <div className="mb-4">
                                <p style={{
                                    textAlign: 'justify',
                                    hyphens: "auto",
                                    fontWeight: 'bolder',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {formData.introduction || 'Introduction text will appear here...'}
                                </p>
                            </div>

                            <div className="mb-4">
                                <img
                                    className="w-100"
                                    src={
                                        (formData.thumbnail.file && formData.thumbnail.file instanceof File)
                                            ? URL.createObjectURL(formData.thumbnail.file)
                                            : formData.thumbnail.link || '/img/placeholder.png'
                                    }
                                    alt={formData.thumbnail.alt || 'Thumbnail'}
                                    style={{ objectFit: 'cover' }}
                                />
                                {formData.thumbnail.alt && (
                                    <div className="text-center mt-2">
                                        <small className="text-muted">{formData.thumbnail.alt}</small>
                                    </div>
                                )}
                            </div>

                            {formData.blog_content.map((section, index) => (
                                <div key={index} className="mb-4">
                                    <h2 className="fw-semibold" style={{
                                        fontFamily: "Roboto, sans-serif",
                                        color: "#562ecc"
                                    }}>
                                        {`${index + 1}. ${section.heading || 'Section Heading'}`}
                                    </h2>
                                    <p style={{ textAlign: "justify", hyphens: "auto" }}>
                                        {section.paragraph || 'Section content will appear here...'}
                                    </p>
                                    <div className="mb-3">
                                        <img
                                            className="w-100"
                                            src={
                                                (section.img.file && section.img.file instanceof File)
                                                    ? URL.createObjectURL(section.img.file)
                                                    : section.img.link || 'https://cdn.bootstrapstudio.io/placeholders/1400x800.png'
                                            }
                                            alt={section.img.alt || 'Section image'}
                                            style={{ objectFit: 'cover' }}
                                        />
                                        {section.img.alt && (
                                            <div className="text-center mt-2">
                                                <small className="text-muted">{section.img.alt}</small>
                                            </div>
                                        )}
                                    </div>
                                    {section.youtube && (
                                        <div className="mb-3">
                                            <div className="ratio ratio-16x9">
                                                <iframe
                                                    src={`https://www.youtube.com/embed/${new URL(section.youtube).searchParams.get("v")}`}
                                                    title="YouTube video"
                                                    allowFullScreen
                                                ></iframe>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateBlog;
