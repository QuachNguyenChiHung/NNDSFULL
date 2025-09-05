import { Button, Col, Form, InputGroup } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 4;
  const navigate = useNavigate()
  useEffect(() => {
    fetchUserdata()
    fetchBlogs();
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
      console.log(res.data)


    } catch (error) {
      navigate('/login')
    }
  }
  const fetchBlogs = async () => {
    try {
      console.log('Attempting to fetch blogs...');
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/blogs/me`, {
        withCredentials: true
      });

      console.log('Response received:', res.data);
      setBlogs(res.data.authorblogs);
    } catch (error) {
      console.log('Error fetching blogs:', error);
      console.log('Error response:', error.response?.data);
      console.log('Error status:', error.response?.status);
    }
  }
  const handledelete = async (b_id) => {
    try {
      console.log('Attempting to fetch blogs...');
      const res = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/blogs/` + b_id, {
        withCredentials: true
      });

      console.log(res.data)
      await fetchBlogs()

    } catch (error) {
      alert(error.response.message)
    }
  }
  // Pagination logic
  const totalPages = Math.ceil(blogs.length / blogsPerPage);
  const startIdx = (currentPage - 1) * blogsPerPage;
  const endIdx = startIdx + blogsPerPage;
  const currentBlogs = blogs.slice(startIdx, endIdx);

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };
  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <Form>
      <div className="container py-4">
        <div className="row mb-4">
          <Col md={3}>
            <InputGroup>
              <InputGroup.Text style={{ border: '1px solid' }}>
                🔍
              </InputGroup.Text>
              <Form.Control placeholder="Nhập tên tác giả" style={{ border: '1px solid' }}></Form.Control>
            </InputGroup>
          </Col>
          <Col md={3}>
            <InputGroup>
              <InputGroup.Text style={{ border: '1px solid' }}>
                🔍
              </InputGroup.Text>
              <Form.Control placeholder="Nhập tên bài viết" style={{ border: '1px solid' }}></Form.Control>
            </InputGroup>
          </Col>
          <Col md={2}>
            <InputGroup>
              <Form.Select onChange={(e) => { alert(e.currentTarget.value) }}>
                <option value="...">{'Không có'}</option>
                <option value="study">{'Học tập'}</option>
                <option value="news">{'Tin tức'}</option>
              </Form.Select>
            </InputGroup>
          </Col>
          <Col md={2}>
            <Button variant="primary" onClick={() => navigate('/admin/create-blog')}>Create a new Blog</Button>
          </Col>
        </div>
        <div className="row gy-4 row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4">
          {(currentBlogs && currentBlogs.length > 0) ? currentBlogs.map((item, idx) => (
            <div className="col" key={item.id || idx}>
              <div className="card h-100 ">
                <img className="card-img-top w-100 d-block fit-cover" src={item?.thumbnail?.link || '/img/placeholder.png'} alt={item?.thumbnail?.alt || '/img/placeholder.png'} style={{ height: '190px' }} />
                <div className="card-body p-4 d-flex flex-column">
                  <h4 className="card-title">{item.blog_title || 'No Title'}</h4>
                  <p className="card-text">{item.introduction ? item.introduction.substring(0, 100) + (item.introduction.length > 100 ? '...' : '') : ''}</p>
                  <div className="mt-auto">
                    <div className="d-flex">
                      <div>
                        <p className="fw-bold mb-0">{item.author.name || 'Unknown Author'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="container-fluid">
                    <div className="row gy-1">
                      <div className="col-12">
                        <Button className="w-100" type="button" onClick={() => navigate(`/blog/${item.id}`)}>View Blog</Button>
                      </div>
                      <div className="col-12">
                        <Button className="w-100" type="button" onClick={() => handledelete(item.id)}>Delete Blog</Button>
                      </div>
                      <div className="col-12">
                        <Button className="w-100" type="button" onClick={() => navigate(`/admin/update-blog/${item.id}`)}>Update Blog</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )) : <div className="col">No blogs found.</div>}
        </div>
        {/* Pagination Controls */}
        <div className="d-flex justify-content-center align-items-center mt-4">
          <button type="button" className="btn btn-outline-primary me-2" onClick={handlePrev} disabled={currentPage === 1}>
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button type="button" className="btn btn-outline-primary ms-2" onClick={handleNext} disabled={currentPage === totalPages || totalPages === 0}>
            Next
          </button>
        </div>
      </div>
    </Form>
  );
}
