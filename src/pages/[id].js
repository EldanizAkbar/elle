import { useEffect, useState } from "react";
import { getProfileInfo } from "../lib/firebase/index";
import Header from "@/components/header";
import FollowButton from "@/components/followButton";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

const defaultProfilePicture = "/profile-picture.png"; 

const UserProfile = ({ id, user}) => {
  const router = useRouter();
  let currentUserId = localStorage.getItem("user");

  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [followersCount, setFollowersCount] = useState(
    user?.followers?.length || 0
  );
  const [followingsCount, setFollowingsCount] = useState(
    user?.followings?.length || 0
  );
  const [followerNames, setFollowerNames] = useState([]);
  const [followingNames, setFollowingNames] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowings, setShowFollowings] = useState(false);

  useEffect(() => {
    setIsCurrentUser(id === currentUserId);
  }, [id, user, currentUserId]);

  useEffect(() => {
    setFollowersCount(user?.followers?.length || 0);
    setFollowingsCount(user?.followings?.length || 0);
    setShowFollowers(false);
    setShowFollowings(false);
  }, [user]);


  const updateCounts = (change) => {
    setFollowersCount((prevCount) => prevCount + change);

    const fetchFollowersInfo = async () => {
      try {
        const followersPromises = user.followers.map(async (follower) => {
          const followerInfo = await getProfileInfo(follower);
          return followerInfo;
        });

        const followersNames = await Promise.all(followersPromises);
        setFollowerNames(followersNames);
      } catch (error) {
        console.error("Error fetching followers info:", error.message);
      }
    };

      fetchFollowersInfo();    
  };


  const handleBackButtonClick = () => {
    router.back();
  };

  useEffect(() => {
    const fetchFollowersInfo = async () => {
      try {
        const followersPromises = user.followers.map(async (follower) => {
          const followerInfo = await getProfileInfo(follower);
          return followerInfo;
        });

        const followersNames = await Promise.all(followersPromises);
        setFollowerNames(followersNames);
      } catch (error) {
        console.error("Error fetching followers info:", error.message);
      }
    };

      fetchFollowersInfo();

  }, [user, showFollowers, followersCount]);

  useEffect(() => {
    const fetchFollowingsInfo = async () => {
      try {
        const followingsPromises = user.followings.map(async (following) => {
          const followingInfo = await getProfileInfo(following);
          return followingInfo;
        });

        const followingsNames = await Promise.all(followingsPromises);
        setFollowingNames(followingsNames);
      } catch (error) {
        console.error("Error fetching followings info:", error.message);
      }
    };

      fetchFollowingsInfo();

  }, [user, showFollowings, followingsCount]);

  const handleShowFollowers = () => {
    setShowFollowers(!showFollowers);
    setShowFollowings(false);
  };

  const handleShowFollowing = () => {
    setShowFollowers(false);
    setShowFollowings(!showFollowings);
  };

  const handleclose = () => {
    setShowFollowers(false);
    setShowFollowings(false);
  }

  return (
    <>
      <Head>
        <title>User Profile</title>
      </Head>
      <Header />
      <div className="container mx-auto mt-8 p-8 bg-white rounded-lg shadow-lg profile_container">
        <div className="flex justify-start mb-4">
          <button
            className="text-blue-500 back_button"
            onClick={handleBackButtonClick}
          >
            &lt; Back
          </button>
        </div>

        <div className="text-center">
          <Image
            src={user?.profilePicture || defaultProfilePicture}
            alt={`${user.fullName}'s Profile`}
            className="w-24 h-24 rounded-full mx-auto mb-4"
            width={100}
            height={100}
          />
          <h1 className="text-2xl font-bold">{user.fullName}</h1>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-700 mb-3">
            <strong>Bio:</strong>
          </p>
          <p className="text-lg">
            <i>{user.bio}</i>
          </p>
          <div className="mt-4">
            <p className="text-gray-700">
              Lives in <strong>{user.address}</strong>
            </p>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex justify-around stats_container mx-auto">
            <div className="text-center"  onClick={handleShowFollowers}>
              <p className="font-bold">
                {followersCount}
              </p>
              <p
                className={`text-gray-600 hover:underline cursor-pointer ${
                  showFollowers && "font-bold"
                }`}
              >
                Followers
              </p>
            </div>
            <div className="text-center"  onClick={handleShowFollowing}>
              <p className="font-bold">
                {followingsCount}
              </p>
              <p
                className={`text-gray-600 hover:underline cursor-pointer ${
                  showFollowings && "font-bold"
                }`}
              >
                Following
              </p>
            </div>
          </div>

          {showFollowers && (
            <div className="mt-4 mx-auto">
              <p className="text-gray-700 text-center text-xl mt-10">
                <strong>Followers:</strong>
              </p>
              {followersCount> 0 ? (
                <ul className="mt-6 users_container mx-auto">
                  {followerNames.map((follower) => (
                    <li key={follower.id} className="mb-4 p-4 bg-gray-100 rounded">
                      <div className="flex items-center gap-3">
                        <Image
                          src={follower.profileImage || defaultProfilePicture}
                          alt={`${follower.fullName}'s Profile Image`}
                          className="w-16 h-16 rounded-full object-cover"
                          width={50}
                          height={50}
                        />
                        <div className="flex flex-col gap-2">
                          <p className="text-lg font-bold">{follower.fullName}</p>
                          <Link
                            href={`/${follower.userId}`}
                            className="text-blue-500 view_profile_btn"
                            onClick={handleclose}
                          >
                            View Profile
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 mt-6 text-center text-lg font-bold"><i>Not followed by anyone.</i></p>
              )}
            </div>
          )}

          {showFollowings && (
            <div className="mt-4 mx-auto">
              <p className="text-gray-700 text-center text-xl mt-10">
                <strong>Followings:</strong>
              </p>
              {followingsCount > 0 ? (
                <ul className="mt-6 users_container mx-auto">
                  {followingNames.map((following) => (
                    <li key={following.id} className="mb-4 p-4 bg-gray-100 rounded">
                      <div className="flex items-center gap-3">
                        <Image
                          src={following.profileImage || defaultProfilePicture}
                          alt={`${following.fullName}'s Profile Image`}
                          className="w-16 h-16 rounded-full object-cover"
                          width={50}
                          height={50}
                        />
                        <div className="flex flex-col gap-2">
                          <p className="text-lg font-bold">{following.fullName}</p>
                          <Link
                            href={`/${following.userId}`}
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
        <div className="mx-auto text-center mt-10">
          {!isCurrentUser && (
            <FollowButton
              currentUserId={currentUserId}
              targetUserId={id}
              updateCounts={updateCounts}
            />
          )}
        </div>
      </div>
    </>
  );
};

export const getServerSideProps = async ({ query }) => {
  try {
    const userData = await getProfileInfo(query.id);

    if (!userData) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        id: query.id,
        user: userData,
      },
    };
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    return {
      props: {},
    };
  }
};

export default UserProfile;
