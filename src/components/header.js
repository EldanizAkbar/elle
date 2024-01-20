import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";

const Header = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if localStorage is available (client-side)
    const isLocalStorageAvailable =
      typeof window !== "undefined" && window.localStorage;

    // Check if the user is authenticated based on localStorage
    if (isLocalStorageAvailable && localStorage.getItem("user")) {
      setAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    // Check if localStorage is available (client-side)
    const isLocalStorageAvailable =
      typeof window !== "undefined" && window.localStorage;

    if (isLocalStorageAvailable) {
      localStorage.removeItem("user");
    }

    setAuthenticated(false);
    window.location.href = "/";
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <nav className="bg-gray-800 p-4 rounded-3xl mt-5 mx-auto">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex-shrink-0">
          <Link href="/">
              <div className="flex items-center cursor-pointer">
                <Image
                  className="h-8 w-auto logo"
                  src="/logo.png"
                  alt="Logo"
                  width={50}
                  height={50}
                />
                <span className="text-white ml-1 font-bold name">Ello</span>
              </div>
            </Link>
          </div>

          <div className="md:hidden">
            {/* Hamburger Icon for Mobile */}
            <button className="text-white" onClick={toggleMobileMenu}>
              <svg
                className="h-8 w-8 mt-2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4 6h16M4 12h16m-7 6h7"></path>
              </svg>
            </button>
          </div>

          <div className="hidden md:flex space-x-4">
            {authenticated ? (
              <>
                <Link
                  href="/"
                  className={`text-white transition duration-300 home ${
                    router.pathname === "/" ? "homeBg" : ""
                  }`}
                >
                  Home
                </Link>

                <Link
                  href="/profile"
                  className={`text-white transition duration-300 profile ${
                    router.pathname === "/profile" ? "profileBg" : ""
                  }`}
                >
                  My Profile
                </Link>

                <Link
                  href="/search"
                  className={`text-white hover:text-gray-300 transition duration-300 users ${
                    router.pathname === "/search" ? "usersBg" : ""
                  }`}
                >
                  Search Users
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-white hover:text-gray-300 transition duration-300 logOutBtn"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`text-white hover:text-gray-300 transition duration-300 login ${
                    router.pathname === "/login" ? "loginBg" : ""
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className={`text-white hover:text-gray-300 transition duration-300 register ${
                    router.pathname === "/register" ? "registerBg" : ""
                  }`}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden mt-2">
            {authenticated ? (
              <>
                <div className="flex flex-col mt-10">
                <Link
                  href="/"
                  className={`text-center transition duration-300 home w-40 mx-auto ${
                    router.pathname === "/" ? "homeBg" : ""
                  }`}
                >
                  Home
                </Link>

                  <Link
                    href="/profile"
                    className={`text-center transition duration-300 w-40 mx-auto profile mt-5 ${
                      router.pathname === "/profile" ? "profileBg" : ""
                    }`}
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/search"
                    className={`text-center transition duration-300 users w-40 mx-auto mt-5 ${
                      router.pathname === "/search" ? "usersBg" : ""
                    }`}
                  >
                    Search Users
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block text-white mt-5 logOutBtn w-40 mx-auto"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-center flex-col mx-auto mt-10">
                  <Link
                    href="/login"
                    className={`text-center transition duration-300 login w-40 mx-auto ${
                      router.pathname === "/login" ? "loginBg" : ""
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className={`text-center transition duration-300 register w-40 mx-auto mt-5 ${
                      router.pathname === "/register" ? "registerBg" : ""
                    }`}
                  >
                    Register
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  );
};

export default Header;
