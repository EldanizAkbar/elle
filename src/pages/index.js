import React, { useState, useEffect } from "react";
import Header from "@/components/header";
import {
  getPosts,
  post,
  getProfileInfo,
  likePost,
  comment,
  getComments,
} from "./lib/firebase";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";

const Home = ({ initialPosts }) => {
  const [posts, setPosts] = useState(initialPosts || []);
  const [newPostContent, setNewPostContent] = useState("");
  const [likedPosts, setLikedPosts] = useState([]);
  const [currentUserID, setCurrentUserID] = useState("");
  const [commentingPostIndex, setCommentingPostIndex] = useState(null);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    setCurrentUserID(localStorage.getItem("user"));
  }, []);

  const formatPostDate = (postDate) => {
    const currentDate = new Date();
    const postDateObj = new Date(postDate);

    const timeDiff = currentDate - postDateObj;
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return postDateObj.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
      });
    } else if (days === 1) {
      return `Yesterday at ${postDateObj.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
      })}`;
    } else if (days < 365) {
      return postDateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } else {
      return postDateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatCommentDate = (commentDate) => {
    const currentDate = new Date();
    const commentDateObj = new Date(commentDate);

    const timeDiff = currentDate - commentDateObj;
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return commentDateObj.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
      });
    } else if (days === 1) {
      return `Yesterday at ${commentDateObj.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
      })}`;
    } else if (days < 365) {
      return commentDateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } else {
      return commentDateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  const handlePost = async () => {
    const currentUserID = localStorage.getItem("user");

    if (!currentUserID) {
      return;
    }

    const name = await getProfileInfo(currentUserID);

    if (newPostContent.trim() !== "") {
      const currentDate = new Date().toString();
      const newPost = {
        content: newPostContent,
        date: currentDate,
        author: currentUserID,
        likes: [],
        authorName: name.fullName,
      };

      // Update the state with the new post
      setPosts((prevPosts) => {
        if (!Array.isArray(prevPosts)) {
          return [newPost];
        }
        return [newPost, ...prevPosts];
      });

      await post(newPost);
      setNewPostContent("");
    }
  };

  const handleLike = async (index) => {
    const currentUserID = localStorage.getItem("user");
    const updatedPosts = [...posts];
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

    setPosts(updatedPosts);

    if (userLiked) {
      setLikedPosts((prevLikedPosts) =>
        prevLikedPosts.filter((date) => date !== postId)
      );
    } else {
      setLikedPosts((prevLikedPosts) => [...prevLikedPosts, postId]);
    }
  };

  const handleComment = async (index) => {
    setCommentingPostIndex(index);
    const postId = posts[index].key;

    const updatedComments = await getComments(postId);
    const updatedPostsWithComments = posts.map((p, i) =>
      i === index ? { ...p, comments: updatedComments } : p
    );
    setPosts(updatedPostsWithComments);
  };

  const handleSendComment = async (postIndex) => {
    const currentUserID = localStorage.getItem("user");
    const postId = posts[postIndex].key;

    const ad = await getProfileInfo(currentUserID).fullName;

    await comment({
      content: commentText,
      date: new Date().toString(),
      postid: postId,
      author: currentUserID,
    });

    // Reload the posts to update comments
    const updatedPosts = await getPosts();
    setPosts(updatedPosts);

    const updatedComments = await getComments(postId);
    const updatedPostsWithComments = posts.map((p, i) =>
      i === postIndex ? { ...p, comments: updatedComments } : p
    );

    setPosts(updatedPostsWithComments);
    setCommentText("");
  };

  const handleCloseComment = () => {
    setCommentText("");
    setCommentingPostIndex(null);
  };

  return (
    <>
      <Head>
        <title>Elle</title>
      </Head>
      <Header />
      <div className="container mx-auto p-4 home_container mt-10">
        <p className="text-center ml-2 font-bold name mx-auto">Ello</p>
        {currentUserID ? (
          <>
            <div className="mb-4 mt-8">
              <div className="flex">
                <Image
                  src="/profile-picture.png"
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full mr-2"
                  width={50}
                  height={50}
                />

                <div className="w-full">
                  <textarea
                    placeholder="What's on your mind?"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="w-full h-20 border p-2 rounded"
                  />

                  <button
                    onClick={handlePost}
                    className="text-white font-bold py-2 px-4 rounded post_button mt-2"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
            {posts.length > 0 ? (
              posts.map((post, index) => (
                <div
                  key={`post_${index}`}
                  className="mb-5 p-4 rounded post_container"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center mb-2">
                      <Link href={`/${post.author}`}>
                        <Image
                          src="/profile-picture.png"
                          alt="User Avatar"
                          className="w-8 h-8 rounded-full mr-2"
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
                    <p className="text-gray-500 mb-2 font-bold">
                      <i>{formatPostDate(post.date)}</i>
                    </p>
                  </div>
                  <p>{post.content}</p>
                  <div className="flex items-center mt-2">
                    <button onClick={() => handleLike(index)} className="mr-2">
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
                    <button
                      onClick={() => handleComment(index)}
                      className="text-blue-500 cursor-pointer"
                    >
                      <Image
                        src="/comment.png"
                        alt="Comment"
                        width={20}
                        height={20}
                      />
                    </button>
                  </div>

                  {/* Comment area */}
                  {commentingPostIndex === index && (
                    <div className="mt-4">
                      <textarea
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="w-full h-12 border p-2 rounded"
                      />
                      <div className="flex mt-2">
                        <button
                          onClick={() => handleSendComment(index)}
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

                      {/* Render comments */}
                      {post.comments &&
                        post.comments.map((comment, commentIndex) => (
                          <div
                            key={`comment_${commentIndex}`}
                            className="mt-8 p-2 comment_container"
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <Link href={`/${comment.author}`}>
                                  <Image
                                    src="/profile-picture.png"
                                    alt="User Avatar"
                                    className="w-6 h-6 rounded-full mr-2"
                                    width={50}
                                    height={50}
                                  />
                                </Link>
                                <p className="text-blue-500 cursor-pointer">
                                  {comment.authorName}
                                </p>
                              </div>
                              <p className="text-gray-500 font-bold">
                                <i>{formatCommentDate(comment.date)}</i>
                              </p>
                            </div>

                            <p>{comment.content}</p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No posts yet. Start by creating a post!</p>
            )}
          </>
        ) : (
          <p className="text-center info mt-10">
            Please login or create an account to view and post content.
          </p>
        )}
      </div>
    </>
  );
};

export const getServerSideProps = async () => {
  try {
    const initialPosts = await getPosts();
    return {
      props: {
        initialPosts,
      },
    };
  } catch (error) {
    console.error("Error fetching initial posts:", error.message);
    return {
      props: {
        initialPosts: [],
      },
    };
  }
};

export default Home;
