import React, { useEffect, useState } from "react";
import {
  getProfileInfo,
  getPostsByUser,
  likePost,
  comment,
  getComments,
} from "../lib/firebase";
import Header from "@/components/header";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { storage } from "../lib/firebase/index";
import { getDatabase, ref as databaseRef, set } from "firebase/database";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
const db = getDatabase();

const defaultProfilePicture = "/profile-picture.png";
const defaultUserImage = "/profile-picture.png";

const Profile = () => {
  const [profileInfo, setProfileInfo] = useState(null);
  const [followerNames, setFollowerNames] = useState([]);
  const [followingNames, setFollowingNames] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowings, setShowFollowing] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [commentingPostIndex, setCommentingPostIndex] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [currentUserID, setCurrentUserID] = useState("");
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("user");
        const info = await getProfileInfo(userId);
        setProfileInfo(info);
        setUserPosts(await getPostsByUser(userId));
        setCurrentUserID(userId);
        setLikedPosts(info.likes || []);

        const imageRef = storageRef(storage, `images/${userId}`);
        const imageUrl = await getDownloadURL(imageRef);

        setProfileInfo((prevInfo) => ({ ...prevInfo, profileImage: imageUrl }));

        if (showFollowers) {
          const followersPromises = info.followers.map(async (follower) => {
            const followerInfo = await getProfileInfo(follower);
            return followerInfo;
          });

          const followersNames = await Promise.all(followersPromises);
          setFollowerNames(followersNames);
        }

        if (showFollowings) {
          const followingsPromises = info.followings.map(async (following) => {
            const followingInfo = await getProfileInfo(following);
            return followingInfo;
          });

          const followingsNames = await Promise.all(followingsPromises);
          setFollowingNames(followingsNames);
        }
      } catch (error) {
        console.error("Error fetching profile info:", error.message);
      }
    };

    fetchData();
  }, [showFollowers, showFollowings]);

  const handleShowFollowers = () => {
    setShowFollowers(!showFollowers);
    setShowFollowing(false);
  };

  const handleShowFollowing = () => {
    setShowFollowers(false);
    setShowFollowing(!showFollowings);
  };

  const formatDate = (date) => {
    const currentDate = new Date();
    const dateObj = new Date(date);

    const timeDiff = currentDate - dateObj;
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
      if (hoursDiff < 12) {
        return dateObj.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "numeric",
        });
      } else {
        return `Yesterday at ${dateObj.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "numeric",
        })}`;
      }
    } else if (days === 1) {
      return `Yesterday at ${dateObj.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
      })}`;
    } else if (days < 365) {
      return dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } else {
      return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  const handleLike = async (index) => {
    const currentUserID = localStorage.getItem("user");
    const updatedPosts = [...userPosts];
    const postId = updatedPosts[index].key;

    // Check if the 'likes' field exists and is an array
    const likesArray = Array.isArray(updatedPosts[index].likes)
      ? updatedPosts[index].likes
      : [];

    // Check if the user already liked the post
    const userLiked = likesArray.includes(currentUserID);

    console.log(currentUserID);

    // Update like count and liked status in the database
    await likePost(
      postId,
      userLiked
        ? likesArray.filter((id) => id !== currentUserID)
        : [...likesArray, currentUserID]
    );

    // Update the state with the new like status
    updatedPosts[index].likes = userLiked
      ? likesArray.filter((id) => id !== currentUserID)
      : [...likesArray, currentUserID];

    setUserPosts(updatedPosts);

    if (userLiked) {
      setLikedPosts((prevLikedPosts) =>
        prevLikedPosts.filter((date) => date !== postId)
      );
    } else {
      setLikedPosts((prevLikedPosts) => [...prevLikedPosts, postId]);
    }
  };

  const handleComment = async (postId) => {
    setCommentingPostIndex(commentingPostIndex === postId ? null : postId);
    setCommentText("");

    const updatedComments = await getComments(postId);
    const updatedPostsWithComments = userPosts.map((post) =>
      post.key === postId ? { ...post, comments: updatedComments } : post
    );

    setUserPosts(updatedPostsWithComments);
  };

  const handleSendComment = async (postId) => {
    await comment({
      content: commentText,
      date: new Date().toString(),
      postid: postId,
      author: currentUserID,
    });

    // Reload the user posts to update comments
    const updatedUserPosts = await getPostsByUser(currentUserID);
    setUserPosts(updatedUserPosts);

    const updatedComments = await getComments(postId);
    const updatedPostsWithComments = userPosts.map((post) =>
      post.key === postId ? { ...post, comments: updatedComments } : post
    );

    setUserPosts(updatedPostsWithComments);
    setCommentText("");
  };

  const handleCloseComment = () => {
    setCommentText("");
    setCommentingPostIndex(null);
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

  const handleImageChange = (e) => {
    setUploadError("Now you can upload the image.");
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    setUploadError(null);
    if (!image) {
      setUploadError("Please choose an image before uploading.");
      return;
    }

    const imageRef = storageRef(storage, "images/" + currentUserID);
    uploadBytes(imageRef, image)
      .then(() => {
        getDownloadURL(imageRef)
          .then((url) => {
            // Update the profileInfo state with the new URL
            setProfileInfo((prevInfo) => ({ ...prevInfo, profileImage: url }));
            set(
              databaseRef(db, "/users/" + currentUserID + "/profileImage"),
              url
            );
          })
          .catch((error) => {
            console.log(error.message, "error getting the image URL");
          });

        setImage(null);
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  const handleRemove = async () => {
    try {
      // Check if the profile image exists before attempting to remove it
      if (
        !profileInfo.profileImage ||
        profileInfo.profileImage === defaultProfilePicture
      ) {
        console.warn("No profile image to remove.");
        return;
      }

      // Remove the image from storage
      const imageRef = storageRef(storage, `images/${currentUserID}`);
      await deleteObject(imageRef);

      // Remove the image URL from the database
      await set(databaseRef(db, `/users/${currentUserID}/profileImage`), null);

      // Update the profileInfo state with the default profile picture
      setProfileInfo((prevInfo) => ({
        ...prevInfo,
        profileImage: defaultProfilePicture,
      }));
    } catch (error) {
      console.error("Error removing profile picture:", error.message);
    }
  };

  return (
    <>
      <Head>
        <title>My Profile</title>
      </Head>
      <Header />
      <div className="container mx-auto mt-8 py-10 pb-20 px-4 bg-white rounded-lg shadow-lg profile_container">
        <div className="text-center">
          <Image
            src={profileInfo.profileImage || defaultProfilePicture}
            alt="Profile"
            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
            width={100}
            height={100}
          />
          <div className="flex flex-col items-center">
            <input
              type="file"
              accept="image/x-png,image/gif,image/jpeg"
              onChange={handleImageChange}
              className="custom-file-input"
            />
            {uploadError && (
              <p className="text-red-500 text-center mt-3">
                <i>{uploadError}</i>
              </p>
            )}
            <button onClick={handleSubmit} className="imgUpload_btn mt-5 mb-3">
              Upload
            </button>
            {profileInfo.profileImage &&
              profileInfo.profileImage !== defaultProfilePicture && (
                <button onClick={handleRemove} className="removeImage_btn mb-8">
                  Remove Image
                </button>
              )}
          </div>

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
            <div
              className="text-center cursor-pointer"
              onClick={handleShowFollowers}
            >
              <p className="font-bold">{profileInfo?.followers?.length || 0}</p>
              <p
                className={`text-gray-600 hover:underline ${
                  showFollowers && "font-bold"
                } `}
              >
                Followers
              </p>
            </div>
            <div
              className="text-center cursor-pointer"
              onClick={handleShowFollowing}
            >
              <p className="font-bold">
                {profileInfo?.followings?.length || 0}
              </p>
              <p
                className={`text-gray-600 hover:underline ${
                  showFollowings && "font-bold"
                } `}
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
                <p className="text-gray-500 mt-6 text-center text-lg font-bold">
                  <i>Not followers.</i>
                </p>
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
                <p className="text-gray-500 mt-6 text-center text-lg font-bold">
                  <i>Not following anyone.</i>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="my-10 mx-auto my_posts py-5 px-2">
        <p className="text-gray-700 text-center text-xl mt-10 mb-10">
          <strong>My Posts:</strong>
        </p>
        {userPosts.length > 0 ? (
          <ul className="mt-6 posts_container mx-auto">
            {userPosts.map((post, index) => (
              <div
                key={`post_${index}`}
                className="mb-5 p-2 md:p-4 rounded post_container mx-auto"
              >
                <div className="flex justify-between items-center gap-3">
                  <div className="flex items-center mb-2">
                    <Link href={`/${post.author}`}>
                      <Image
                        src={profileInfo.profileImage || defaultUserImage}
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full mr-2 object-cover"
                        width={50}
                        height={50}
                      />
                    </Link>
                    <Link href={`/${post.author}`}>
                      <p className="text-blue-500 cursor-pointer font-bold  hover:underline  duration-150 ease-in-out ">
                        {post.authorName}
                      </p>
                    </Link>
                  </div>
                  <p className="text-gray-500 mb-2 font-bold text-sm">
                    <i>{formatDate(post.date)}</i>
                  </p>
                </div>
                <div className="flex wrap">
                  <p className="ps-10 break-words w-full">{post.content}</p>
                </div>

                <div className="flex items-center mt-2">
                  <button onClick={() => handleLike(index)} className="mr-1">
                    <Image
                      src={
                        Array.isArray(post.likes) &&
                        post.likes.includes(currentUserID)
                          ? "/like.png"
                          : "/dislike.png"
                      }
                      alt="Like"
                      width={20}
                      height={20}
                    />
                  </button>
                  <p className="mr-2">
                    {Array.isArray(post.likes) ? post.likes.length : 0}
                  </p>
                  <div className="ms-8 flex items-center">
                    <button
                      onClick={() => handleComment(post.key)}
                      className="text-blue-500 cursor-pointer"
                    >
                      <Image
                        src="/comment.png"
                        alt="Comment"
                        width={20}
                        height={20}
                      />
                    </button>
                    <span className="ml-1">
                      {post.comments
                        ? post.comments.length > 0
                          ? post.comments.length
                          : 0
                        : 0}
                    </span>
                  </div>
                </div>

                {/* Comment area */}
                {commentingPostIndex === post.key && (
                  <div className="mt-4">
                    <textarea
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="w-full h-12 border p-2 rounded"
                    />
                    <div className="flex mt-2">
                      <button
                        onClick={() => handleSendComment(post.key)}
                        className="text-white font-bold py-2 px-4 rounded mr-2 send_button"
                      >
                        Send
                      </button>
                      <button
                        onClick={handleCloseComment}
                        className="text-gray-800 font-bold py-2 px-4 rounded close_button"
                      >
                        Close
                      </button>
                    </div>

                    <div className="comment_area">
                      {post.comments &&
                        post.comments.map((comment, commentIndex) => (
                          <div
                            key={`comment_${commentIndex}`}
                            className="mt-8 p-2 comment_container"
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <Link
                                  href={`/${comment.author}`}
                                  className="flex"
                                >
                                  <Image
                                    src={
                                      comment?.authorImage || defaultUserImage
                                    }
                                    alt="User Avatar"
                                    className="w-6 h-6 rounded-full mr-2 object-cover"
                                    width={50}
                                    height={50}
                                  />
                                  <p className="text-blue-500 cursor-pointer">
                                    {comment.authorName}
                                  </p>
                                </Link>
                              </div>
                              <p className="text-gray-500 font-bold">
                                <i>{formatDate(comment.date)}</i>
                              </p>
                            </div>
                            <div className="flex items-center wrap">
                              <p className="ps-8 w-full break-words">
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 mt-6 text-center text-lg font-bold">
            <i>No posts yet.</i>
          </p>
        )}
      </div>
    </>
  );
};

export default Profile;
