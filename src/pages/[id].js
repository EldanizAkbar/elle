import { useEffect, useState } from "react";
import { getProfileInfo } from "./lib/firebase/index";
import Header from "@/components/header";
import FollowButton from "@/components/followButton";
import { useRouter } from "next/router";
import Head from "next/head";

const defaultProfilePicture =
  "https://toppng.com/public/uploads/preview/instagram-default-profile-picture-11562973083brycehrmyv.png"; // Replace with your default image URL

const UserProfile = ({ id, user }) => {
  const router = useRouter();
  let currentUserId = localStorage.getItem("user");

  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [followersCount, setFollowersCount] = useState(
    user?.followers?.length || 0
  );
  const [followingsCount, setFollowingsCount] = useState(
    user?.followings?.length || 0
  );

  useEffect(() => {
    setIsCurrentUser(id === currentUserId);
  }, [user, currentUserId]);

  const updateCounts = (change) => {
    setFollowersCount((prevCount) => prevCount + change);
  };

  const handleBackButtonClick = () => {
    router.back(); // Go back to the previous page
  };

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
          <img
            src={user.profilePicture || defaultProfilePicture}
            alt={`${user.fullName}'s Profile`}
            className="w-24 h-24 rounded-full mx-auto mb-4"
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
            <div className="text-center">
              <p className="font-bold">{followersCount}</p>
              <p className="text-gray-600">Followers</p>
            </div>
            <div className="text-center">
              <p className="font-bold">{followingsCount}</p>
              <p className="text-gray-600">Following</p>
            </div>
          </div>
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
