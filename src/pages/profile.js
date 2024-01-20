import React, { useEffect, useState } from "react";
import { getProfileInfo } from "../lib/firebase"; // Adjust the path based on your project structure
import Header from "@/components/header";
import Head from "next/head";
import Image from "next/image";

const defaultProfilePicture = "/profile-picture.png";

const Profile = () => {
  const [profileInfo, setProfileInfo] = useState(null);

  useEffect(() => {
    const fetchProfileInfo = async () => {
      try {
        // Get the user ID from local storage
        const userId = localStorage.getItem("user");

        // Fetch the user information based on the user ID
        const info = await getProfileInfo(userId);
        setProfileInfo(info);
      } catch (error) {
        console.error("Error fetching profile info:", error.message);
        // Handle error or redirect to an error page
      }
    };

    fetchProfileInfo();
  }, []);

  if (!profileInfo) {
    // Loading state or redirect to a loading indicator
    return (
      <>
        <Head>
          <title>My Profile</title>
        </Head>
        <Header />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>My Profile</title>
      </Head>
      <Header />
      <div className="container mx-auto mt-8 p-8 bg-white rounded-lg shadow-lg profile_container">
        <div className="text-center">
          <Image
            src={profileInfo.profilePicture || defaultProfilePicture}
            alt="Profile"
            className="w-24 h-24 rounded-full mx-auto mb-4"
            width={100}
            height={100}
          />
          <h1 className="text-2xl font-bold">{profileInfo.fullName}</h1>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-700 mb-3">
            <strong>Bio:</strong>
          </p>
          <p className="text-lg">
            <i>{profileInfo.bio}</i>
          </p>
          <div className="mt-4">
            <p className="text-gray-700">
              Lives in <strong>{profileInfo.address}</strong>
            </p>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex justify-around stats_container mx-auto">
            <div className="text-center">
              <p className="font-bold">{profileInfo?.followers?.length || 0}</p>
              <p className="text-gray-600">Followers</p>
            </div>
            <div className="text-center">
              <p className="font-bold">
                {profileInfo?.followings?.length || 0}
              </p>
              <p className="text-gray-600">Following</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
