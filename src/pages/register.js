import React, { useRef, useState } from "react";
import { signUp } from "./lib/firebase/index";
import Header from "../components/header";
import Head from "next/head";
import Link from "next/link";

export default function Register() {
  const fullNameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const repeatPasswordRef = useRef(null);
  const addressRef = useRef(null);
  const bioRef = useRef(null);

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    repeatPassword: "",
    address: "",
    bio: "",
  });

  const handleRegister = async () => {
    try {
      // Reset errors
      setErrors({
        fullName: "",
        email: "",
        password: "",
        repeatPassword: "",
        address: "",
        bio: "",
      });

      let isValid = true;

      // Validate full name
      if (
        fullNameRef.current.value.length < 3 ||
        fullNameRef.current.value.length > 20
      ) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          fullName: "Full name should be between 3 and 20 characters.",
        }));
        isValid = false;
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailRef.current.value)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          email: "Invalid email address.",
        }));
        isValid = false;
      }

      // Validate password
      if (passwordRef.current.value.length < 4) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: "Password should be at least 4 characters.",
        }));
        isValid = false;
      }

      // Validate repeat password
      if (passwordRef.current.value !== repeatPasswordRef.current.value) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          repeatPassword: "Passwords do not match.",
        }));
        isValid = false;
      }

      // Validate address
      if (
        addressRef.current.value.length < 3 ||
        addressRef.current.value.length > 30
      ) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          address: "Address should be between 3 and 30 characters.",
        }));
        isValid = false;
      }

      // Validate bio
      if (bioRef.current.value.length < 3 || bioRef.current.value.length > 50) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          bio: "Bio should be between 3 and 50 characters.",
        }));
        isValid = false;
      }

      if (isValid) {
        // Call the signUp function to register the user
        await signUp({
          fullName: fullNameRef.current.value,
          email: emailRef.current.value,
          password: passwordRef.current.value,
          address: addressRef.current.value,
          bio: bioRef.current.value,
        });

        // Clear form fields
        fullNameRef.current.value = "";
        emailRef.current.value = "";
        passwordRef.current.value = "";
        repeatPasswordRef.current.value = "";
        addressRef.current.value = "";
        bioRef.current.value = "";

        alert("Registration successful!");
        return (window.location.href = "./");
      }
    } catch (error) {
      console.error("Registration Error:", error.message);
      if (error.message === "Email is already registered") {
        setErrors((prevErrors) => ({
          ...prevErrors,
          email: "Email is already registered.",
        }));
      }
    }
  };

  return (
    <>
      <Head>
        <title>Register</title>
      </Head>
      <Header />
      <div className="p-2 flex items-center justify-center mt-10">
        <div className="container max-w-screen-lg mx-auto bg-white p-6">
          <div>
            <h2 className="font-semibold text-xl text-gray-600">
              Registration Form
            </h2>
            <p className="text-gray-500 mb-6 mt-5">
              Please fill in the form to register an account.
            </p>
            <div className="bg-white rounded shadow-lg p-4 px-4 md:p-8 mb-6">
              <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-5">
                <div className="md:col-span-5 mb-5">
                  <label htmlFor="full_name">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    id="full_name"
                    className={`h-10 border mt-1 rounded px-4 w-full ${
                      errors.fullName ? "border-red-500" : "bg-gray-50"
                    }`}
                    ref={fullNameRef}
                  />
                  {errors.fullName && (
                    <p className="text-red-500">{errors.fullName}</p>
                  )}
                </div>
                <div className="md:col-span-5 mb-5">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="text"
                    name="email"
                    id="email"
                    className={`h-10 border mt-1 rounded px-4 w-full ${
                      errors.email ? "border-red-500" : "bg-gray-50"
                    }`}
                    ref={emailRef}
                    placeholder="email@domain.com"
                  />
                  {errors.email && (
                    <p className="text-red-500">{errors.email}</p>
                  )}
                </div>
                <div className="md:col-span-2 mb-5">
                  <label htmlFor="Password">Password</label>
                  <input
                    type="password"
                    name="Password"
                    id="Password"
                    className={`h-10 border mt-1 rounded px-4 w-full ${
                      errors.password ? "border-red-500" : "bg-gray-50"
                    }`}
                    ref={passwordRef}
                  />
                  {errors.password && (
                    <p className="text-red-500">{errors.password}</p>
                  )}
                </div>
                <div className="md:col-span-2 mb-5">
                  <label htmlFor="RepeatPassword">Repeat Password</label>
                  <input
                    type="password"
                    name="RepeatPassword"
                    id="RepeatPassword"
                    className={`h-10 border mt-1 rounded px-4 w-full ${
                      errors.repeatPassword ? "border-red-500" : "bg-gray-50"
                    }`}
                    ref={repeatPasswordRef}
                  />
                  {errors.repeatPassword && (
                    <p className="text-red-500">{errors.repeatPassword}</p>
                  )}
                </div>
                <div className="md:col-span-5 mb-5">
                  <label htmlFor="address">Address</label>
                  <div
                    className={`h-10 bg-gray-50 flex border border-gray-200 rounded items-center mt-1`}
                  >
                    <input
                      type="address"
                      name="address"
                      id="address"
                      placeholder="Narva mnt 25, Tartu, Estonia"
                      className={`px-4 appearance-none outline-none text-gray-800 w-full bg-transparent ${
                        errors.address ? "border-red-500" : ""
                      }`}
                      ref={addressRef}
                    />
                  </div>
                  {errors.address && (
                    <p className="text-red-500">{errors.address}</p>
                  )}
                </div>
                <div className="md:col-span-4 mb-5">
                  <label htmlFor="zipcode">BIO</label>
                  <textarea
                    type="text"
                    name="zipcode"
                    id="zipcode"
                    className={`transition-all flex items-center h-10 border mt-1 rounded px-4 py-2 w-full bg-gray-50 min-h-28 ${
                      errors.bio ? "border-red-500" : ""
                    }`}
                    placeholder="I am a software developer."
                    ref={bioRef}
                  />
                  {errors.bio && <p className="text-red-500">{errors.bio}</p>}
                </div>
                <div className="md:col-span-5 text-right">
                  <div className="inline-flex items-end">
                    <button
                      onClick={handleRegister}
                      className="text-white font-bold py-2 px-4 rounded submit_btn"
                    >
                      Submit
                    </button>
                  </div>
                  <div className="mx-auto text-center here_container">
                    <span>You already have an account </span>
                    <Link href="/login" className="here">
                      Login here
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
