import { useState } from 'react'
import './style.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import MainPage from './pages/public/MainPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login';
import BlogPage from './pages/public/BlogPage';
import AdminUsers from './pages/admin/AdminUsers';
import Layout from './Layout';
import './responsive-iframe.css';
import AdminBlogs from './pages/admin/AdminBlogs';
import AdminLayout from './pages/admin/AdminLayout';
import ProfilePage from './pages/admin/ProfilePage';
import CreateBlogtemp from './pages/admin/CreateBlogtemp';
import UpdateBlog from './pages/admin/UpdateBlog';
import NotFound from './pages/public/NotFound';
import NewsList from './pages/public/CategoryList';
import EnterInfo from './pages/auth/EnterInfo';
import ResetPassword from './pages/auth/ResetPassword';
import OTP from './pages/auth/OTP';

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/login/setInfo" element={<EnterInfo />} />
        <Route path="/login/reset-password" element={<ResetPassword />} />
        <Route path="/login/otp" element={<OTP />} />
        <Route
          path="/"
          element={
            <Layout>
              <MainPage />
            </Layout>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/blogs"
          element={
            <AdminLayout>
              <AdminBlogs />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/create-blog"
          element={
            <AdminLayout>
              <CreateBlogtemp />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/update-blog/:id"
          element={
            <AdminLayout>
              <UpdateBlog />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <AdminLayout>
              <ProfilePage />
            </AdminLayout>
          }
        />
        <Route
          path="/blog/:id"
          element={
            <Layout>
              <BlogPage />
            </Layout>
          }
        />
        <Route
          path="/blog/category/:category"
          element={
            <Layout>
              <NewsList />
            </Layout>
          }
        />
        <Route
          path="*"
          element={
            <Layout>
              <NotFound />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App
