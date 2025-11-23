import React, { useState } from "react";
import { Building2 } from "lucide-react";
import Dashboard from "./Dashboard";

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    accountType: "member",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      console.log("Login submitted:", {
        email: formData.email,
        password: formData.password,
      });
      // Simulate successful login
      setCurrentUser({
        email: formData.email,
        fullName: formData.fullName || "User",
        accountType: "member",
      });
      setIsAuthenticated(true);
    } else {
      console.log("Register submitted:", formData);
      // Simulate successful registration
      setCurrentUser({
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone,
        accountType: formData.accountType,
      });
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setFormData({
      email: "",
      password: "",
      fullName: "",
      phone: "",
      accountType: "member",
    });
  };

  // If authenticated, show dashboard
  if (isAuthenticated && currentUser) {
    return <Dashboard user={currentUser} onLogout={handleLogout} />;
  }

  // Otherwise, show login/register form

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      {/* Animated background elements */}
       <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-3xl mb-6 shadow-2xl transform hover:scale-105 transition-all duration-300">
            <Building2 className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          <h1
            className="text-4xl font-bold text-white mb-2 tracking-tight"
            style={{ fontFamily: '"DM Sans", sans-serif' }}
          >
            Kost Management
          </h1>
          <p
            className="text-purple-100 text-lg"
            style={{ fontFamily: '"Inter", sans-serif' }}
          >
            Sistem Pengelolaan Sewa Kost
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
          {/* Card Header */}
          <div className="p-8 pb-6">
            <h2
              className="text-2xl font-bold text-gray-800 mb-2"
              style={{ fontFamily: '"DM Sans", sans-serif' }}
            >
              Selamat Datang
            </h2>
            <p className="text-gray-500 mb-6">
              {isLogin
                ? "Masuk atau daftar untuk melanjutkan"
                : "Masuk atau daftar untuk melanjutkan"}
            </p>

            {/* Toggle Buttons */}
            <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all duration-300 ${
                  isLogin
                    ? "bg-white text-gray-900 shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                style={{ fontFamily: '"Inter", sans-serif' }}
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all duration-300 ${
                  !isLogin
                    ? "bg-white text-gray-900 shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                style={{ fontFamily: '"Inter", sans-serif' }}
              >
                Daftar
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Register-only fields */}
              {!isLogin && (
                <>
                  <div className="form-group">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-2"
                      style={{ fontFamily: '"Inter", sans-serif' }}
                    >
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      style={{ fontFamily: '"Inter", sans-serif' }}
                      required={!isLogin}
                    />
                  </div>
                </>
              )}

              {/* Email */}
              <div className="form-group">
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  style={{ fontFamily: '"Inter", sans-serif' }}
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  style={{ fontFamily: '"Inter", sans-serif' }}
                  required
                />
              </div>

              {/* Register-only phone field */}
              {!isLogin && (
                <div className="form-group">
                  <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    style={{ fontFamily: '"Inter", sans-serif' }}
                  >
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="08123456789"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    style={{ fontFamily: '"Inter", sans-serif' }}
                    required={!isLogin}
                  />
                </div>
              )}

              {/* Password */}
              <div className="form-group">
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  style={{ fontFamily: '"Inter", sans-serif' }}
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  style={{ fontFamily: '"Inter", sans-serif' }}
                  required
                />
              </div>
              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-2"
                style={{ fontFamily: '"Inter", sans-serif' }}
              >
                {isLogin ? "Masuk" : "Daftar"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
