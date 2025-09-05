import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [formData, setFormData] = useState({
        name: '',
        mail: '',
        phone_number: '',
        bio_json: {}
    });
    const [errors, setErrors] = useState({});
    const [newFieldKey, setNewFieldKey] = useState('');
    const [newFieldValue, setNewFieldValue] = useState('');
    const [showImageModal, setShowImageModal] = useState(false);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [showCropModal, setShowCropModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState();
    const [croppedImageUrl, setCroppedImageUrl] = useState('');
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const imgRef = useRef(null);
    const canvasRef = useRef(null);

    // Toast functionality
    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 5000);
    };

    useEffect(() => {
        (async () => {
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
                const userData = res.data.user || res.data;
                setUser(userData);

                // Initialize form data with user data
                const defaultBioJson = {
                    hobby: '',
                    address: '',
                    studying_working_at: '',
                    ...(userData.bio_json || {})
                };
                setFormData({
                    name: userData.name || '',
                    mail: userData.mail || '',
                    phone_number: userData.phone_number || '',
                    bio_json: defaultBioJson
                });
            } catch (e) {
                setError("Failed to fetch profile");
                console.error('Profile fetch error:', e);
            }
        })();
    }, []);

    const handleEditClick = () => {
        // Ensure form data is synced with current user data
        const defaultBioJson = {
            hobby: '',
            address: '',
            studying_working_at: '',
            ...(user.bio_json || {})
        };
        setFormData({
            name: user.name || '',
            mail: user.mail || '',
            phone_number: user.phone_number || '',
            bio_json: defaultBioJson
        });
        setIsEditing(true);
    };

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

    const handleBioJsonChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            bio_json: {
                ...prev.bio_json,
                [key]: value
            }
        }));
    };

    const handleAddCustomField = () => {
        if (!newFieldKey.trim() || !newFieldValue.trim()) {
            showToast('Please enter both field name and value', 'error');
            return;
        }

        const key = newFieldKey.toLowerCase().replace(/\s+/g, '_');
        handleBioJsonChange(key, newFieldValue);
        setNewFieldKey('');
        setNewFieldValue('');
        showToast('Custom field added successfully', 'success');
    };

    const handleRemoveField = (key) => {
        setFormData(prev => {
            const newBioJson = { ...prev.bio_json };
            delete newBioJson[key];
            return {
                ...prev,
                bio_json: newBioJson
            };
        });
        showToast('Field removed successfully', 'success');
    };

    // Utility function to convert base64 to File object
    const base64ToFile = (base64String, fileName) => {
        // Remove data URL prefix if present
        const base64Data = base64String.split(',')[1] || base64String;
        const mimeType = base64String.split(',')[0].split(':')[1].split(';')[0] || 'image/jpeg';

        // Convert base64 to binary
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);

        // Create File object
        return new File([byteArray], fileName, { type: mimeType });
    };

    // Utility function to convert blob to File object
    const blobToFile = (blob, fileName) => {
        return new File([blob], fileName, {
            type: blob.type || 'image/jpeg',
            lastModified: Date.now()
        });
    };

    const handleImageClick = () => {
        setShowImageModal(true);
    };

    const handleViewImage = () => {
        if (user.img_link) {
            window.open(user.img_link, '_blank');
        }
        setShowImageModal(false);
    };

    const handleChangeImage = () => {
        setShowImageModal(false);

        // Create file input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    setSelectedImage(reader.result);
                    setShowCropModal(true);
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    const onImageLoad = (e) => {
        const { width, height } = e.currentTarget;
        const crop = centerCrop(
            makeAspectCrop(
                {
                    unit: '%',
                    width: 90,
                },
                1,
                width,
                height
            ),
            width,
            height
        );
        setCrop(crop);
    };

    const getCroppedImg = (image, crop) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!crop || !canvas || !ctx) {
            return;
        }

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        const pixelRatio = window.devicePixelRatio;

        canvas.width = crop.width * pixelRatio * scaleX;
        canvas.height = crop.height * pixelRatio * scaleY;

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width * scaleX,
            crop.height * scaleY
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', 1);
        });
    };

    const handleCropComplete = async () => {
        if (completedCrop && imgRef.current && canvasRef.current) {
            const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);

            if (croppedImageBlob) {
                // Convert blob to File object
                const croppedImageFile = blobToFile(croppedImageBlob, `profile-${Date.now()}.jpg`);

                // Also create base64 for immediate UI display
                const reader = new FileReader();
                reader.onload = () => {
                    const base64Data = reader.result;
                    setCroppedImageUrl(base64Data);

                    // Update user state immediately with cropped image
                    setUser({ ...user, img_link: base64Data });

                    // Upload the cropped image file
                    uploadCroppedImageFile(croppedImageFile, base64Data);

                    // Show initial message
                    showToast('Image cropped successfully! Preparing to upload...', 'info');
                };
                reader.readAsDataURL(croppedImageBlob);
            }
        }
        setShowCropModal(false);
    };

    const uploadCroppedImageFile = async (imageFile, base64Preview) => {
        setIsUploadingImage(true);
        showToast('🔄 Uploading your profile image...', 'info');

        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('profile_image', imageFile);
            formData.append('name', user.name);
            formData.append('mail', user.mail);
            formData.append('phone_number', user.phone_number || '');

            // Add bio_json data
            Object.entries(user.bio_json || {}).forEach(([key, value]) => {
                formData.append(`bio_json[${key}]`, value);
            });

            const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/user/me`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.status === 200) {
                // Update user data with the response
                const updatedUser = response.data.user || response.data;
                setUser(updatedUser);

                // Update form data as well to keep everything in sync
                setFormData(prev => ({
                    ...prev,
                    img_link: updatedUser.img_link || base64Preview
                }));

                // Dispatch custom event to notify AdminSidebar
                const profileUpdateEvent = new CustomEvent('profileUpdated', {
                    detail: { user: updatedUser }
                });
                window.dispatchEvent(profileUpdateEvent);

                showToast('✅ Profile image uploaded successfully!', 'success');
            }
        } catch (error) {
            console.error('Image file upload error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to upload profile image';
            showToast(`❌ Upload failed: ${errorMessage}`, 'error');

            // Revert the image if upload failed
            const userData = user;
            setUser(userData);
        } finally {
            setIsUploadingImage(false);
        }
    };

    const uploadCroppedImage = async (base64Image) => {
        setIsUploadingImage(true);
        showToast('🔄 Uploading your profile image...', 'info');

        try {
            // Here you would typically upload to your image hosting service
            // For now, we'll use the base64 directly or you can implement upload to your backend
            const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/user/me`,
                { ...formData, img_link: base64Image },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200) {
                // Update user data with the response
                const updatedUser = response.data.user || response.data;
                setUser(updatedUser);

                // Update form data as well to keep everything in sync
                setFormData(prev => ({
                    ...prev,
                    img_link: base64Image
                }));

                // Dispatch custom event to notify AdminSidebar
                const profileUpdateEvent = new CustomEvent('profileUpdated', {
                    detail: { user: updatedUser }
                });
                window.dispatchEvent(profileUpdateEvent);

                showToast('✅ Profile image uploaded successfully!', 'success');
            }
        } catch (error) {
            console.error('Image update error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update profile image';
            showToast(`❌ Upload failed: ${errorMessage}`, 'error');

            // Revert the image if upload failed
            const userData = user;
            setUser(userData);
        } finally {
            setIsUploadingImage(false);
        }
    };

    const updateProfileImage = async (imageUrl) => {
        setIsUploadingImage(true);
        showToast('🔄 Updating your profile image...', 'info');

        try {
            const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/user/me`,
                { ...formData, img_link: imageUrl },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200) {
                setUser({ ...user, img_link: imageUrl });

                // Dispatch custom event to notify AdminSidebar
                const updatedUser = { ...user, img_link: imageUrl };
                const profileUpdateEvent = new CustomEvent('profileUpdated', {
                    detail: { user: updatedUser }
                });
                window.dispatchEvent(profileUpdateEvent);

                showToast('✅ Profile image updated successfully!', 'success');
            }
        } catch (error) {
            console.error('Image update error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update profile image';
            showToast(`❌ Update failed: ${errorMessage}`, 'error');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name || formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters long';
        }

        if (!formData.mail || !/\S+@\S+\.\S+/.test(formData.mail)) {
            newErrors.mail = 'Please enter a valid email address';
        }

        if (formData.phone_number && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone_number)) {
            newErrors.phone_number = 'Please enter a valid phone number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            showToast('Please fix the validation errors', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/user/me`, formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                setUser(response.data);
                setIsEditing(false);

                // Dispatch custom event to notify AdminSidebar
                const profileUpdateEvent = new CustomEvent('profileUpdated', {
                    detail: { user: response.data }
                });
                window.dispatchEvent(profileUpdateEvent);

                showToast('Profile updated successfully!', 'success');
            }
        } catch (error) {
            console.error('Update error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update profile';
            showToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        // Reset form data to original user data
        const defaultBioJson = {
            hobby: '',
            address: '',
            studying_working_at: '',
            ...(user.bio_json || {})
        };
        setFormData({
            name: user.name || '',
            mail: user.mail || '',
            phone_number: user.phone_number || '',
            bio_json: defaultBioJson
        });
        setErrors({});
        setNewFieldKey('');
        setNewFieldValue('');
        setIsEditing(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (error) return (
        <div className="container py-4">
            <div className="alert alert-danger">{error}</div>
        </div>
    );

    if (!user) return (
        <div className="container py-4">
            <div className="text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading profile...</p>
            </div>
        </div>
    );

    return (
        <div className="container py-4" style={{ maxWidth: '800px' }}>
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
                <div className="col-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h2 className="mb-0">
                                <i className="fas fa-user me-2"></i>
                                My Profile
                            </h2>
                            {!isEditing ? (
                                <button
                                    className="btn btn-primary"
                                    onClick={handleEditClick}
                                >
                                    <i className="fas fa-edit me-2"></i>
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="btn-group">
                                    <button
                                        className="btn btn-success"
                                        onClick={handleSave}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-save me-2"></i>
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={handleCancel}
                                        disabled={isSubmitting}
                                    >
                                        <i className="fas fa-times me-2"></i>
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="card-body">
                            {!isEditing ? (
                                // View Mode
                                <div className="row">
                                    <div className="col-md-12 mb-4">
                                        <div className="position-relative d-inline-block">
                                            <img
                                                src={user.img_link || '/img/user.png'}
                                                className="rounded-circle"
                                                style={{
                                                    width: '128px',
                                                    height: '128px',
                                                    objectFit: 'cover',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    border: '3px solid #dee2e6'
                                                }}
                                                alt="Profile"
                                                onClick={handleImageClick}
                                                onError={(e) => {
                                                    e.target.src = '/img/default-avatar.png';
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.transform = 'scale(1.05)';
                                                    e.target.style.borderColor = '#7e4cde';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.transform = 'scale(1)';
                                                    e.target.style.borderColor = '#dee2e6';
                                                }}
                                            />
                                            <div
                                                className="position-absolute"
                                                style={{
                                                    bottom: '8px',
                                                    right: '8px',
                                                    backgroundColor: isUploadingImage ? '#ffc107' : '#7e4cde',
                                                    borderRadius: '50%',
                                                    width: '32px',
                                                    height: '32px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: isUploadingImage ? 'not-allowed' : 'pointer',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onClick={!isUploadingImage ? handleImageClick : undefined}
                                                onMouseEnter={(e) => {
                                                    if (!isUploadingImage) {
                                                        e.target.style.backgroundColor = '#562ecc';
                                                        e.target.style.transform = 'scale(1.1)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isUploadingImage) {
                                                        e.target.style.backgroundColor = '#7e4cde';
                                                        e.target.style.transform = 'scale(1)';
                                                    }
                                                }}
                                            >
                                                {isUploadingImage ? (
                                                    <div className="spinner-border spinner-border-sm" role="status" style={{ width: '16px', height: '16px', color: 'white' }}>
                                                        <span className="visually-hidden">Uploading...</span>
                                                    </div>
                                                ) : (
                                                    <i className="fas fa-camera" style={{ color: 'white', fontSize: '14px' }}></i>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-4">
                                            <label className="form-label fw-bold text-muted">Full Name</label>
                                            <p className="fs-5">{user.name || 'Not provided'}</p>
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label fw-bold text-muted">Email Address</label>
                                            <p className="fs-5">
                                                <i className="fas fa-envelope me-2 text-muted"></i>
                                                {user.mail || 'Not provided'}
                                            </p>
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label fw-bold text-muted">Phone Number</label>
                                            <p className="fs-5">
                                                <i className="fas fa-phone me-2 text-muted"></i>
                                                {user.phone_number || 'Not provided'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="mb-4">
                                            <label className="form-label fw-bold text-muted">Role</label>
                                            <p className="fs-5">
                                                <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'} fs-6`}>
                                                    <i className="fas fa-user-tag me-2"></i>
                                                    {user.role || 'User'}
                                                </span>
                                            </p>
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label fw-bold text-muted">Member Since</label>
                                            <p className="fs-5">
                                                <i className="fas fa-calendar-alt me-2 text-muted"></i>
                                                {formatDate(user.date_created)}
                                            </p>
                                        </div>

                                        {user.bio_json && Object.keys(user.bio_json).length > 0 && (
                                            <div className="mb-4">
                                                <label className="form-label fw-bold text-muted">Additional Information</label>
                                                <div className="table-responsive">
                                                    <table className="table table-bordered table-sm">
                                                        <thead className="table-light">
                                                            <tr>
                                                                <th style={{ width: '40%' }}>Field</th>
                                                                <th style={{ width: '60%' }}>Value</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {Object.entries(user.bio_json)
                                                                .filter(([key, value]) => value && value.toString().trim() !== '')
                                                                .map(([key, value], index) => (
                                                                    <tr key={index}>
                                                                        <td className="fw-semibold text-capitalize">
                                                                            {key.replace(/_/g, ' ')}
                                                                        </td>
                                                                        <td>
                                                                            {typeof value === 'object' && value !== null
                                                                                ? JSON.stringify(value, null, 2)
                                                                                : String(value)
                                                                            }
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                // Edit Mode
                                <form>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Full Name <span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                                    value={formData.name}
                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                    placeholder="Enter your full name"
                                                />
                                                {errors.name && (
                                                    <div className="invalid-feedback">{errors.name}</div>
                                                )}
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Email Address <span className="text-danger">*</span></label>
                                                <input
                                                    type="email"
                                                    className={`form-control ${errors.mail ? 'is-invalid' : ''}`}
                                                    value={formData.mail}
                                                    onChange={(e) => handleInputChange('mail', e.target.value)}
                                                    placeholder="Enter your email address"
                                                />
                                                {errors.mail && (
                                                    <div className="invalid-feedback">{errors.mail}</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    className={`form-control ${errors.phone_number ? 'is-invalid' : ''}`}
                                                    value={formData.phone_number}
                                                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                                                    placeholder="Enter your phone number"
                                                />
                                                {errors.phone_number && (
                                                    <div className="invalid-feedback">{errors.phone_number}</div>
                                                )}
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Role</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={user.role || ''}
                                                    disabled
                                                    placeholder="Role cannot be changed"
                                                />
                                                <small className="text-muted">Role can only be changed by administrators</small>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Information Section */}
                                    <div className="row mt-4">
                                        <div className="col-12">
                                            <h5 className="mb-3">
                                                <i className="fas fa-info-circle me-2"></i>
                                                Additional Information
                                            </h5>

                                            {/* Predefined Fields */}
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="mb-3">
                                                        <label className="form-label">Hobby</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={formData.bio_json.hobby || ''}
                                                            onChange={(e) => handleBioJsonChange('hobby', e.target.value)}
                                                            placeholder="Enter your hobbies"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="mb-3">
                                                        <label className="form-label">Address</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={formData.bio_json.address || ''}
                                                            onChange={(e) => handleBioJsonChange('address', e.target.value)}
                                                            placeholder="Enter your address"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-md-12">
                                                    <div className="mb-3">
                                                        <label className="form-label">Studying/Working At</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={formData.bio_json.studying_working_at || ''}
                                                            onChange={(e) => handleBioJsonChange('studying_working_at', e.target.value)}
                                                            placeholder="Enter where you're studying or working"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Custom Fields */}
                                            {Object.entries(formData.bio_json)
                                                .filter(([key]) => !['hobby', 'address', 'studying_working_at'].includes(key))
                                                .length > 0 && (
                                                    <div className="mb-4">
                                                        <h6 className="text-muted mb-3">Custom Fields</h6>
                                                        {Object.entries(formData.bio_json)
                                                            .filter(([key]) => !['hobby', 'address', 'studying_working_at'].includes(key))
                                                            .map(([key, value], index) => (
                                                                <div key={index} className="row mb-2">
                                                                    <div className="col-md-4">
                                                                        <input
                                                                            type="text"
                                                                            className="form-control form-control-sm"
                                                                            value={key.replace(/_/g, ' ')}
                                                                            disabled
                                                                        />
                                                                    </div>
                                                                    <div className="col-md-6">
                                                                        <input
                                                                            type="text"
                                                                            className="form-control form-control-sm"
                                                                            value={value || ''}
                                                                            onChange={(e) => handleBioJsonChange(key, e.target.value)}
                                                                            placeholder="Enter value"
                                                                        />
                                                                    </div>
                                                                    <div className="col-md-2">
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-outline-danger btn-sm"
                                                                            onClick={() => handleRemoveField(key)}
                                                                            title="Remove field"
                                                                        >
                                                                            Remove Field
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                    </div>
                                                )}

                                            {/* Add New Field */}
                                            <div className="card bg-light">
                                                <div className="card-body">
                                                    <h6 className="card-title">
                                                        <i className="fas fa-plus me-2"></i>
                                                        Add Custom Field
                                                    </h6>
                                                    <div className="row">
                                                        <div className="col-md-4">
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={newFieldKey}
                                                                onChange={(e) => setNewFieldKey(e.target.value)}
                                                                placeholder="Field name (e.g., School, Company)"
                                                            />
                                                        </div>
                                                        <div className="col-md-6">
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={newFieldValue}
                                                                onChange={(e) => setNewFieldValue(e.target.value)}
                                                                placeholder="Field value"
                                                                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomField()}
                                                            />
                                                        </div>
                                                        <div className="col-md-2">
                                                            <button
                                                                type="button"
                                                                className="btn btn-primary btn-sm"
                                                                onClick={handleAddCustomField}
                                                                disabled={!newFieldKey.trim() || !newFieldValue.trim()}
                                                            >
                                                                Add Field
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {Object.keys(errors).length > 0 && (
                                        <div className="alert alert-warning">
                                            <i className="fas fa-exclamation-triangle me-2"></i>
                                            Please fix the errors above before saving.
                                        </div>
                                    )}
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Options Modal */}
            {showImageModal && (
                <div
                    className="modal fade show"
                    style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onClick={() => setShowImageModal(false)}
                >
                    <div className="modal-dialog modal-dialog-centered modal-sm">
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fas fa-image me-2"></i>
                                    Profile Picture Options
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowImageModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body p-2">
                                <div className="d-grid gap-2">
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={handleViewImage}
                                    >
                                        <i className="fas fa-eye me-2"></i>
                                        View Full Image
                                    </button>
                                    <button
                                        className="btn btn-outline-success"
                                        onClick={handleChangeImage}
                                    >
                                        <i className="fas fa-crop me-2"></i>
                                        Upload & Crop New Image
                                    </button>
                                </div>
                            </div>
                            <div className="modal-footer p-2">
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setShowImageModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Crop Modal */}
            {showCropModal && selectedImage && (
                <div
                    className="modal fade show"
                    style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.8)' }}
                    onClick={() => setShowCropModal(false)}
                >
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fas fa-crop me-2"></i>
                                    Crop Your Profile Picture
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowCropModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body p-3">
                                <div className="text-center mb-3">
                                    <small className="text-muted">
                                        <i className="fas fa-info-circle me-1"></i>
                                        Drag to reposition and resize the crop area to frame your image perfectly
                                    </small>
                                </div>

                                <div className="d-flex justify-content-center">
                                    <ReactCrop
                                        crop={crop}
                                        onChange={(pixelCrop, percentCrop) => setCrop(percentCrop)}
                                        onComplete={(pixelCrop, percentCrop) => {
                                            setCompletedCrop(pixelCrop);
                                            // Update preview canvas in real-time
                                            if (pixelCrop && imgRef.current && canvasRef.current) {
                                                const canvas = canvasRef.current;
                                                const ctx = canvas.getContext('2d');
                                                const image = imgRef.current;

                                                const scaleX = image.naturalWidth / image.width;
                                                const scaleY = image.naturalHeight / image.height;

                                                canvas.width = 80;
                                                canvas.height = 80;

                                                ctx.drawImage(
                                                    image,
                                                    pixelCrop.x * scaleX,
                                                    pixelCrop.y * scaleY,
                                                    pixelCrop.width * scaleX,
                                                    pixelCrop.height * scaleY,
                                                    0,
                                                    0,
                                                    80,
                                                    80
                                                );
                                            }
                                        }}
                                        aspect={1}
                                        circularCrop={true}
                                        minWidth={50}
                                        minHeight={50}
                                        style={{ maxWidth: '100%', maxHeight: '400px' }}
                                    >
                                        <img
                                            ref={imgRef}
                                            alt="Crop me"
                                            src={selectedImage}
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '400px',
                                                objectFit: 'contain'
                                            }}
                                            onLoad={onImageLoad}
                                        />
                                    </ReactCrop>
                                </div>

                                {/* Preview */}
                                {completedCrop && (
                                    <div className="mt-3 text-center">
                                        <div className="d-inline-block">
                                            <p className="mb-2 text-muted">Preview:</p>
                                            <canvas
                                                ref={canvasRef}
                                                style={{
                                                    border: '2px solid #dee2e6',
                                                    borderRadius: '50%',
                                                    width: '80px',
                                                    height: '80px',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowCropModal(false)}
                                >
                                    <i className="fas fa-times me-2"></i>
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleCropComplete}
                                    disabled={!completedCrop || isUploadingImage}
                                >
                                    {isUploadingImage ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-check me-2"></i>
                                            Apply Crop
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
