import React, { useRef, useState } from "react";
import { login } from "./lib/firebase/index";
import Header from "../components/header";
import Head from "next/head";
import Link from "next/link";

export default function Login() {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    try {
      setError(null);

      const email = emailRef.current.value;
      const password = passwordRef.current.value;

      await login({ email, password });

      // Redirect to the home page or any other desired page after successful login
      window.location.href = "/";
    } catch (error) {
      console.error("Login Error:", error.message);

      setError("Wrong email or password");
    }
  };

  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <Header />
      <div className="p-3 mt-10 flex items-center justify-center m-0 w-full">
        <div className="container max-w-screen-sm mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 md:p-8">
            <h2 className="text-2xl font-semibold text-gray-600">Login Form</h2>
            <p className="text-gray-500 mb-6 mt-3">
              Login to your account using your email and password.
            </p>
            <div className="bg-white rounded shadow-lg p-4">
              <div className="gap-4 text-sm mx-auto">
                <div className="mb-10">
                  <label htmlFor="email" className="block text-gray-600 mb-2">
                    Email Address
                  </label>
                  <input
                    type="text"
                    name="email"
                    id="email"
                    className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                    ref={emailRef}
                    placeholder="email@domain.com"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="Password"
                    className="block text-gray-600 mb-2"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    name="Password"
                    id="Password"
                    className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                    ref={passwordRef}
                  />
                </div>
                {error && (
                  <div className="col-span-2 mb-4">
                    <p className="text-red-500">{error}</p>
                  </div>
                )}
                <div className="col-span-2 mt-10">
                  <button
                    onClick={handleLogin}
                    className="text-white font-bold py-2 px-4 rounded submit_btn"
                  >
                    Submit
                  </button>
                </div>
              </div>
              <div className="mx-auto text-center here_container">
                <span>You do not have an account </span>
                <Link href="/register" className="here">
                  Register here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
