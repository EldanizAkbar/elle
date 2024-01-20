import React, { useEffect, useState } from "react";
import { getProfileInfo } from "../lib/firebase";
import Header from "@/components/header";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

const defaultProfilePicture = "/profile-picture.png";
const defaultUserImage = "/profile-picture.png";

const Profile = () => {
  const [profileInfo, setProfileInfo] = useState(null);
  const [followerNames, setFollowerNames] = useState([]);
  const [followingNames, setFollowingNames] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowings, setShowFollowing] = useState(false);

  useEffect(() => {
    const fetchProfileInfo = async () => {
      try {
        const userId = localStorage.getItem("user");
        const info = await getProfileInfo(userId);
        setProfileInfo(info);
      } catch (error) {
        console.error("Error fetching profile info:", error.message);
      }
    };

    fetchProfileInfo();
  }, []);

  useEffect(() => {
    const fetchFollowersInfo = async () => {
      try {
        const followersPromises = profileInfo.followers.map(async (follower) => {
          const followerInfo = await getProfileInfo(follower);
          return followerInfo;
        });

        const followersNames = await Promise.all(followersPromises);
        setFollowerNames(followersNames);
      } catch (error) {
        console.error("Error fetching followers info:", error.message);
      }
    };

    if (showFollowers) {
      fetchFollowersInfo();
    }
  }, [showFollowers, profileInfo]);

  useEffect(() => {
    const fetchFollowingsInfo = async () => {
      try {
        const followingsPromises = profileInfo.followings.map(async (following) => {
          const followingInfo = await getProfileInfo(following);
          return followingInfo;
        });

        const followingsNames = await Promise.all(followingsPromises);
        setFollowingNames(followingsNames);
      } catch (error) {
        console.error("Error fetching followings info:", error.message);
      }
    };

    if (showFollowings) {
      fetchFollowingsInfo();
    }
  }, [showFollowings, profileInfo]);

  const handleShowFollowers = () => {
    setShowFollowers(!showFollowers);
    setShowFollowing(false);
  };

  const handleShowFollowing = () => {
    setShowFollowers(false);
    setShowFollowing(!showFollowings);
  };

  if (!profileInfo) {
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
      <div className="container mx-auto mt-8 py-6 px-4 bg-white rounded-lg shadow-lg profile_container">
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
            <div className="text-center cursor-pointer" onClick={handleShowFollowers}>
              <p className="font-bold">{profileInfo?.followers?.length || 0}</p>
              <p className="text-gray-600 hover:underline">Followers</p>
            </div>
            <div className="text-center cursor-pointer" onClick={handleShowFollowing}>
              <p className="font-bold">{profileInfo?.followings?.length || 0}</p>
              <p className="text-gray-600 hover:underline">Following</p>
            </div>
          </div>

          {showFollowers && (
            <div className="mt-4 mx-auto">
              <p className="text-gray-700 text-center text-xl mt-10">
                <strong>Followers:</strong>
              </p>
              {followerNames.length > 0 ? (
                <ul className="mt-6 users_conatiner mx-auto">
                  {followerNames.map((user) => (
                    <li key={user.id} className="mb-4 p-4 bg-gray-100 rounded">
                      <div className="flex items-center gap-3">
                        <Image
                          src={user.profileImage || defaultUserImage}
                          alt={`${user.fullName}'s Profile Image`}
                          className="w-16 h-16 rounded-full object-cover"
                          width={50}
                          height={50}
                        />
                        <div className="flex flex-col gap-2">
                          <p className="text-lg font-bold">{user.fullName}</p>
                          <Link
                            href={`/${user.userId}`}
                            className="text-blue-500 view_profile_btn"
                          >
                            View Profile
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 mt-6 text-center text-lg font-bold"><i>Not followers.</i></p>
              )}
            </div>
          )}

          {showFollowings && (
            <div className="mt-4 mx-auto">
              <p className="text-gray-700 text-center text-xl mt-10">
                <strong>Followings:</strong>
              </p>
              {followingNames.length > 0 ? (
                <ul className="mt-6 users_conatiner mx-auto">
                  {followingNames.map((user) => (
                    <li key={user.id} className="mb-4 p-4 bg-gray-100 rounded">
                      <div className="flex items-center gap-3">
                        <Image
                          src={user.profileImage || defaultUserImage}
                          alt={`${user.fullName}'s Profile Image`}
                          className="w-16 h-16 rounded-full object-cover"
                          width={50}
                          height={50}
                        />
                        <div className="flex flex-col gap-2">
                          <p className="text-lg font-bold">{user.fullName}</p>
                          <Link
                            href={`/${user.userId}`}
                            className="text-blue-500 view_profile_btn"
                          >
                            View Profile
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 mt-6 text-center text-lg font-bold"><i>Not following anyone.</i></p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
