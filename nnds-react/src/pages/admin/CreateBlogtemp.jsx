import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
const CreateBlogtemp = () => {
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [isFormValid, setIsFormValid] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const MAX_TITLE_LENGTH = 100;
    const MIN_TITLE_LENGTH = 5;
    const MAX_INTRO_LENGTH = 500;
    const MAX_SECTION_HEADING_LENGTH = 50;
    const MAX_SECTION_PARAGRAPH_LENGTH = 2000;
    const MAX_SECTIONS = 10;
    const INTRO_WARNING_THRESHOLD = MAX_INTRO_LENGTH * 0.8;

    useEffect(() => {
        fetchUserdata();
    }, []);



    const fetchUserdata = async () => {
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
        } catch (error) {
            navigate('/login');
        }
    }

    const Message = (value) => {
        if (value) {
            const temp = value.toLowerCase();
            if (temp.includes('invalid') || temp.includes('error')) {
                return (
                    <label style={{ color: 'red' }}>{value}</label>
                );
            }
            return <label style={{ color: 'red' }}>{value}</label>;
        }
        return null;
    }
    const [formData, setFormData] = useState({
        blog_title: '',
        introduction: '',
        thumbnail: {
            link: '',
            alt: '',
            file: null,
            message: ''
        },
        category: 'study',
        blog_content: [
            {
                heading: '',
                paragraph: '',
                img: {
                    link: '',
                    alt: '',
                    file: null,
                    message: ''
                },
                youtube: '',
                message: ''
            }
        ]
    });
    useEffect(() => {
        validateForm();
    }, [formData]);
    function appendFormData(fd, data) {
        // top level
        fd.append("blog_title", data.blog_title);
        fd.append("introduction", data.introduction);
        fd.append("category", data.category);

        // thumbnail
        fd.append("thumbnail[link]", data.thumbnail.link);
        fd.append("thumbnail[alt]", data.thumbnail.alt);
        fd.append("thumbnail[file]", data.thumbnail.file);

        // blog_content (array)
        if (Array.isArray(data.blog_content)) {
            data.blog_content.forEach((section, i) => {
                fd.append(`blog_content[${i}][heading]`, section.heading);
                fd.append(`blog_content[${i}][paragraph]`, section.paragraph);

                fd.append(`blog_content[${i}][img][link]`, section.img.link);
                fd.append(`blog_content[${i}][img][alt]`, section.img.alt);
                if (section.img.file) fd.append(`blog_content[${i}][img][file]`, section.img.file);

                fd.append(`blog_content[${i}][youtube]`, section.youtube);
            });
        }

        // debug printout
        for (let [key, val] of fd.entries()) {
            console.log(key, val);
        }

        (async () => {
            setIsSubmitting(true);
            try {
                const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/create-blog`, fd, { withCredentials: true });
                if (res.status === 201) {
                    alert('Successfully created a blog!!');
                    console.log(res.data.data);
                    navigate('/admin/blogs'); // Redirect to blogs list
                } else {
                    alert('Failed to create blog');
                }
            } catch (error) {
                alert('Error: ' + (error.response?.data?.message || error.message));
                console.error('Blog creation error:', error);
            } finally {
                setIsSubmitting(false);
            }
        })();
    }

    const [showPreview, setShowPreview] = useState(false);

    const handlefieldChange = (key, value) => {
        setFormData(prev => {
            const newForm = { ...prev };
            // For title, trim whitespace
            if (key === 'blog_title') {
                newForm[key] = value;
            } else {
                newForm[key] = value;
            }
            return newForm;
        });

        // Clear error when user makes changes
        if (errors[key]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[key];
                return newErrors;
            });
        }
    }
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

    const handleThumbnailChange = (key, value) => {
        setFormData(prev => {
            const newForm = { ...prev };
            newForm.thumbnail[key] = value;
            return newForm;
        });

        // Clear error when user makes changes
        if (errors[`thumbnail_${key}`]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`thumbnail_${key}`];
                return newErrors;
            });
        }
    }
    const handleBlogContentField = (key, index, value) => {
        //if key has format: img.file or img.link or img.alt split it
        /**
         * img:{
         *  file:'',
         *  link:'',
         *  alt:''
         * }
         */
        if (key.startsWith("img")) {
            const seperate = key.split(".");
            setFormData(prev => {
                const newForm = { ...prev };
                newForm.blog_content[index][seperate[0]][seperate[1]] = value;
                return newForm;
            });

            // Clear error when user makes changes
            const errorKey = `section_${index}_${key}`;
            if (errors[errorKey]) {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[errorKey];
                    return newErrors;
                });
            }
        }
        else {
            setFormData(prev => {
                const newForm = { ...prev };
                newForm.blog_content[index][key] = value;
                return newForm;
            });

            // Clear error when user makes changes
            const errorKey = `section_${index}_${key}`;
            if (errors[errorKey]) {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[errorKey];
                    return newErrors;
                });
            }
        }
    }
    const addSection = () => {
        if (formData.blog_content.length < MAX_SECTIONS) {
            setFormData(prev => ({
                ...prev,
                blog_content: [
                    ...prev.blog_content,
                    {
                        heading: '',
                        paragraph: '',
                        img: {
                            link: '',
                            alt: '',
                            file: null,
                            message: ''
                        },
                        youtube: '',
                        message: ''
                    }
                ]
            }));
        }
    };

    const removeSection = (index) => {
        if (formData.blog_content.length > 1) {
            const updatedContent = formData.blog_content.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                blog_content: updatedContent
            }));
        }
    };

    const togglePreview = () => {
        setShowPreview(!showPreview);
    };



    const renderPreview = () => {
        if (!showPreview) return null;

        return (
            <div className="card mb-4">
                <div className="card-header" style={{ backgroundColor: "#28a745", color: "white" }}>
                    <h5 className="mb-0">Blog Preview</h5>
                </div>
                <div className="card-body">
                    {/* Preview content matching BlogPage structure */}
                    <div className="container" style={{ maxWidth: "800px" }}>
                        <div className="row">
                            <div className="col-12">
                                <div className="w-100">
                                    <h1
                                        className="fw-bolder text-center"
                                        style={{
                                            fontFamily: "Roboto, sans-serif",
                                            color: "#7e4cde",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        {formData.blog_title || 'Blog Title'}
                                    </h1>
                                </div>
                            </div>
                            <div className="col-12">
                                <p style={{ textAlign: 'justify', hyphens: "auto", fontWeight: 'bolder', whiteSpace: 'pre-wrap' }}>
                                    {formData.introduction || 'Blog introduction will appear here...'}
                                </p>
                            </div>
                            <div className="col-12">
                                <div className="w-100">
                                    <img
                                        className="w-100"
                                        src={
                                            formData.thumbnail.link
                                            || (formData.thumbnail.file && formData.thumbnail.file ? URL.createObjectURL(formData.thumbnail.file) : '/img/placeholder.png')
                                        }
                                        alt={formData.thumbnail.alt || 'Thumbnail'}
                                        style={{ objectFit: "cover" }}
                                    />
                                </div>
                            </div>


                            <div className="col-12 ">
                                <div className="w-100 d-flex justify-content-center">
                                    <p className='mt-3'>
                                        {formData.thumbnail.alt || ''}
                                    </p>
                                </div>
                            </div>
                            <div className="col-12">
                                {formData.blog_content.map((section, index) => (
                                    <div key={index} className="w-100 mb-4">
                                        <h2
                                            className="fw-semibold"
                                            style={{ fontFamily: "Roboto, sans-serif", color: "#562ecc" }}
                                        >
                                            {`${index + 1}.${section.heading || 'Section Heading'}`}
                                        </h2>
                                        <p
                                            style={{
                                                textAlign: "justify",
                                                hyphens: "auto",
                                                borderColor: "rgb(0,0,0)",
                                                whiteSpace: "pre-wrap"
                                            }}
                                        >
                                            {section.paragraph || 'Section paragraph will appear here...'}
                                        </p>
                                        <div className="row mt-4">
                                            <div className="col-12">
                                                <div className="w-100">
                                                    <img
                                                        className="w-100"
                                                        src={
                                                            section.img.link
                                                            || (section.img.file && section.img.file ? URL.createObjectURL(section.img.file) : '/img/placeholder.png')
                                                        }
                                                        alt={section.img.alt || 'Section image'}
                                                        style={{ objectFit: "cover" }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-12 ">
                                                <div className="w-100 d-flex justify-content-center">
                                                    <p className='mt-3'>
                                                        {section.img.alt || ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        {section.youtube && (
                                            <div className="row mt-4">
                                                <div className="col-12">
                                                    <div className="w-100">
                                                        <div className="responsive-iframe-container">
                                                            <iframe
                                                                className="responsive-iframe"
                                                                src={`https://www.youtube.com/embed/${new URL(section.youtube).searchParams.get("v")}`}
                                                                title="YouTube video"
                                                                allowFullScreen
                                                            ></iframe>
                                                        </div>
                                                    </div>
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

    return (
        <div className="container mt-4" style={{ maxWidth: "1000px" }}>
            <div className="row">
                <div className="col-12">
                    <h1 className="fw-bolder text-center mb-4" style={{ color: "#7e4cde" }}>
                        CREATE NEW BLOG
                    </h1>

                    {/* Preview Toggle Button */}
                    <div className="text-center mb-4">
                        <button
                            type="button"
                            className="btn btn-outline-success btn-lg"
                            onClick={togglePreview}
                        >
                            {showPreview ? 'Hide Preview' : 'Show Preview'}
                        </button>
                        <button onClick={() => console.log(formData)}>
                            Console
                        </button>
                    </div>

                    {/* Preview Section */}
                    {renderPreview()}

                    <form onSubmit={() => { }}>
                        {/* Main Blog Information */}
                        <div className="card mb-4">
                            <div className="card-header" style={{ backgroundColor: "#7e4cde", color: "white" }}>
                                <h5 className="mb-0">Blog Information</h5>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Blog Title <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.blog_title ? 'is-invalid' : ''}`}
                                        value={formData.blog_title}
                                        onChange={(e) => handlefieldChange('blog_title', e.target.value)}
                                        placeholder="Enter blog title (5-100 characters)"
                                        maxLength={MAX_TITLE_LENGTH}
                                        required
                                    />
                                    {errors.blog_title && (
                                        <div className="invalid-feedback">{errors.blog_title}</div>
                                    )}
                                    <small className="form-text text-muted">
                                        {formData.blog_title.length}/{MAX_TITLE_LENGTH} characters
                                    </small>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold">Introduction <span className="text-danger">*</span></label>
                                    <textarea
                                        className={`form-control ${errors.introduction ? 'is-invalid' : ''}`}
                                        rows="4"
                                        value={formData.introduction}
                                        onChange={(e) => handlefieldChange('introduction', e.target.value)}
                                        placeholder={`Enter blog introduction (max ${MAX_INTRO_LENGTH} characters)`}
                                        maxLength={MAX_INTRO_LENGTH}
                                        required
                                    />
                                    {errors.introduction && (
                                        <div className="invalid-feedback">{errors.introduction}</div>
                                    )}
                                    <small className={`form-text ${formData.introduction.length > INTRO_WARNING_THRESHOLD ? 'text-warning' : 'text-muted'}`}>
                                        {formData.introduction.length}/{MAX_INTRO_LENGTH} characters
                                        {formData.introduction.length > INTRO_WARNING_THRESHOLD && " (approaching limit)"}
                                    </small>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold">Category</label>
                                    <select
                                        className="form-select"
                                        // value={formData.category}
                                        onChange={(e) => handlefieldChange('category', e.target.value)}
                                    >
                                        <option value="study">Study (Học tập)</option>
                                        <option value="news">News (Tin tức)</option>
                                    </select>
                                </div>

                                <div className="row">
                                    <div className="col-12 mb-3">
                                        <label className="form-label fw-bold">Thumbnail Image</label>
                                        <div className="card">
                                            <div className="card-body">
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <label className="form-label">Upload Image</label>
                                                        <input
                                                            type="file"
                                                            className="form-control"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files[0];
                                                                handleThumbnailChange('file', file)
                                                            }}
                                                            disabled={!!formData.thumbnail.link}
                                                        />
                                                        {/*uploadingImages.thumbnail && (
                                                            <div className="text-primary mt-1">
                                                                <small>Uploading...</small>
                                                            </div>
                                                        )*/}
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Or Enter URL</label>
                                                        <input
                                                            type="url"
                                                            className={`form-control ${errors.thumbnail_link ? 'is-invalid' : ''}`}
                                                            disabled={!!formData.thumbnail.file}
                                                            value={formData.thumbnail.link}
                                                            onChange={(e) => {
                                                                try {
                                                                    const url = e.target.value;
                                                                    handleThumbnailChange('link', url);

                                                                    if (url && !isValidImageUrl(url)) {
                                                                        setErrors(prev => ({
                                                                            ...prev,
                                                                            thumbnail_link: 'URL must be https:// and end with an image extension (.jpg, .png, etc.)'
                                                                        }));
                                                                    }
                                                                } catch (error) {
                                                                    setErrors(prev => ({
                                                                        ...prev,
                                                                        thumbnail_link: 'Invalid URL'
                                                                    }));
                                                                }
                                                            }}
                                                            placeholder="https://example.com/image.jpg"
                                                        />
                                                        {errors.thumbnail_link && (
                                                            <div className="invalid-feedback">{errors.thumbnail_link}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="row mt-2">
                                                    <div className="col-12">
                                                        <label className="form-label">Alt Text {(formData.thumbnail.link || formData.thumbnail.file) && <span className="text-danger">*</span>}</label>
                                                        <input
                                                            type="text"
                                                            className={`form-control ${errors.thumbnail_alt ? 'is-invalid' : ''}`}
                                                            value={formData.thumbnail.alt}
                                                            onChange={(e) => handleThumbnailChange('alt', e.target.value)}
                                                            placeholder="Image description"
                                                            required={!!(formData.thumbnail.link || formData.thumbnail.file)}
                                                        />
                                                        {errors.thumbnail_alt && (
                                                            <div className="invalid-feedback">{errors.thumbnail_alt}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                {(formData.thumbnail.link || formData.thumbnail.file) && (
                                                    <div className="row mt-2">
                                                        <div className="col-12">
                                                            <img
                                                                src={formData.thumbnail.link || URL.createObjectURL(formData.thumbnail.file)}
                                                                alt="Thumbnail preview"
                                                                className="img-thumbnail"
                                                                style={{ maxHeight: '150px', maxWidth: '100%' }}
                                                                onError={(e) => {
                                                                    //    e.target.style.display = 'none';
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Blog Content Sections */}
                        <div className="card mb-4">
                            <div className="card-header d-flex justify-content-between align-items-center" style={{ backgroundColor: "#562ecc", color: "white" }}>
                                <h5 className="mb-0">Blog Content Sections (Optional)</h5>
                                <button
                                    type="button"
                                    className="btn btn-light btn-sm"
                                    onClick={addSection}
                                    disabled={formData.blog_content.length >= MAX_SECTIONS}
                                >
                                    + Add Section {formData.blog_content.length >= MAX_SECTIONS && '(Max Reached)'}
                                </button>
                            </div>
                            {errors.blog_content && (
                                <div className="alert alert-danger m-2 mb-0">
                                    {errors.blog_content}
                                </div>
                            )}
                            <div className="card-body">
                                {formData.blog_content.map((section, index) => (
                                    <div key={index} className="border rounded p-3 mb-3" style={{ backgroundColor: "#f8f9fa" }}>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="mb-0" style={{ color: "#562ecc" }}>
                                                Section {index + 1}
                                            </h6>
                                            {formData.blog_content.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => removeSection(index)}
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Heading <span className="text-danger">*</span></label>
                                            <input
                                                type="text"
                                                className={`form-control ${errors[`section_${index}_heading`] ? 'is-invalid' : ''}`}
                                                value={section.heading}
                                                onChange={(e) => handleBlogContentField('heading', index, e.currentTarget.value)}
                                                placeholder={`Enter section heading (max ${MAX_SECTION_HEADING_LENGTH} characters)`}
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
                                            <label className="form-label fw-bold">Paragraph <span className="text-danger">*</span></label>
                                            <textarea
                                                className={`form-control ${errors[`section_${index}_paragraph`] ? 'is-invalid' : ''}`}
                                                rows="4"
                                                value={section.paragraph}
                                                onChange={(e) => handleBlogContentField('paragraph', index, e.currentTarget.value)}
                                                placeholder={`Enter section paragraph (max ${MAX_SECTION_PARAGRAPH_LENGTH} characters)`}
                                                maxLength={MAX_SECTION_PARAGRAPH_LENGTH}
                                            />
                                            {errors[`section_${index}_paragraph`] && (
                                                <div className="invalid-feedback">{errors[`section_${index}_paragraph`]}</div>
                                            )}
                                            <small className="form-text text-muted">
                                                {section.paragraph.length}/{MAX_SECTION_PARAGRAPH_LENGTH} characters
                                            </small>
                                        </div>                                        <div className="row mb-3">
                                            <div className="col-12">
                                                <label className="form-label fw-bold">Section Image</label>
                                                <div className="card">
                                                    <div className="card-body">
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <label className="form-label">Upload Image</label>
                                                                <input
                                                                    type="file"
                                                                    className={`form-control ${errors[`section_${index}_img_file`] ? 'is-invalid' : ''}`}
                                                                    accept="image/*"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files[0];
                                                                        if (file) {
                                                                            // Check file size (2MB = 2 * 1024 * 1024)
                                                                            if (file.size > 2 * 1024 * 1024) {
                                                                                setErrors(prev => ({
                                                                                    ...prev,
                                                                                    [`section_${index}_img_file`]: 'File size cannot exceed 2MB'
                                                                                }));
                                                                            } else {
                                                                                handleBlogContentField('img.file', index, file);
                                                                            }
                                                                        }
                                                                    }}
                                                                    disabled={!!section.img.link}
                                                                />
                                                                {errors[`section_${index}_img_file`] && (
                                                                    <div className="invalid-feedback">{errors[`section_${index}_img_file`]}</div>
                                                                )}
                                                            </div>
                                                            <div className="col-md-6">
                                                                <label className="form-label">Or Enter URL</label>
                                                                <input
                                                                    type="url"
                                                                    className={`form-control ${errors[`section_${index}_img_link`] ? 'is-invalid' : ''}`}
                                                                    value={section.img.link || ''}
                                                                    onChange={(e) => {
                                                                        const url = e.currentTarget.value;
                                                                        handleBlogContentField('img.link', index, url);

                                                                        if (url && !isValidImageUrl(url)) {
                                                                            setErrors(prev => ({
                                                                                ...prev,
                                                                                [`section_${index}_img_link`]: 'URL must be https:// and end with an image extension'
                                                                            }));
                                                                        }
                                                                    }}
                                                                    placeholder="https://example.com/image.jpg"
                                                                    disabled={!!section.img.file}
                                                                />
                                                                {errors[`section_${index}_img_link`] && (
                                                                    <div className="invalid-feedback">{errors[`section_${index}_img_link`]}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="row mt-2">
                                                            <div className="col-12">
                                                                <label className="form-label">Alt Text {(section.img.link || section.img.file) && <span className="text-danger">*</span>}</label>
                                                                <input
                                                                    type="text"
                                                                    className={`form-control ${errors[`section_${index}_img_alt`] ? 'is-invalid' : ''}`}
                                                                    value={section.img.alt}
                                                                    onChange={(e) => handleBlogContentField('img.alt', index, e.currentTarget.value)}
                                                                    placeholder="Image description"
                                                                    required={!!(section.img.link || section.img.file)}
                                                                />
                                                                {errors[`section_${index}_img_alt`] && (
                                                                    <div className="invalid-feedback">{errors[`section_${index}_img_alt`]}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {(section.img.link || section.img.file) && (
                                                            <div className="row mt-2">
                                                                <div className="col-12">
                                                                    <img
                                                                        src={section.img.link || URL.createObjectURL(section.img.file)}
                                                                        alt={section.img.alt}
                                                                        className="img-thumbnail"
                                                                        style={{ maxHeight: '150px', maxWidth: '100%' }}
                                                                        onError={(e) => {
                                                                            e.target.style.display = 'none';
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-bold">YouTube Video URL (Optional)</label>
                                            <input
                                                type="url"
                                                className={`form-control ${errors[`section_${index}_youtube`] ? 'is-invalid' : ''}`}
                                                value={section.youtube || ''}
                                                onChange={(e) => {
                                                    const url = e.currentTarget.value;
                                                    handleBlogContentField('youtube', index, url);

                                                    if (url && !isValidYouTubeUrl(url)) {
                                                        setErrors(prev => ({
                                                            ...prev,
                                                            [`section_${index}_youtube`]: 'Must be a valid YouTube URL with video ID (https://www.youtube.com/watch?v=VIDEO_ID)'
                                                        }));
                                                    }
                                                }}
                                                placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
                                            />
                                            {errors[`section_${index}_youtube`] ? (
                                                <div className="invalid-feedback">{errors[`section_${index}_youtube`]}</div>
                                            ) : (
                                                <div className="form-text">
                                                    Enter a YouTube video URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}

                        <div className="text-center mb-4">
                            <button
                                type="button"
                                className="btn btn-primary btn-lg px-5"
                                style={{ backgroundColor: "#7e4cde", borderColor: "#7e4cde" }}
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
                                        Creating Blog...
                                    </>
                                ) : (
                                    'Create Blog'
                                )}
                            </button>

                            {!isFormValid && Object.keys(errors).length > 0 && (
                                <div className="alert alert-warning mt-3">
                                    Please fix the validation errors before submitting.
                                </div>
                            )}

                            {isSubmitting && (
                                <div className="alert alert-info mt-3">
                                    <i className="bi bi-info-circle me-2"></i>
                                    Please wait while your blog is being created...
                                </div>
                            )}
                        </div>


                        {/* Message Display */}
                        {/* {message && (
                            <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'}`}>
                                {message}
                            </div>
                        )} */}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateBlogtemp;
