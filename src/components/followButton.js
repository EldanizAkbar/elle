import React, { useState, useEffect } from "react";
import { follow, unfollow, getFollowStatus } from "../lib/firebase/index";

const FollowButton = ({ currentUserId, targetUserId, updateCounts }) => {
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchFollowStatus = async () => {
      try {
        const followStatus = await getFollowStatus(currentUserId, targetUserId);
        setIsFollowing(followStatus);
      } catch (error) {
        console.error("Error fetching follow status:", error.message);
      }
    };

    fetchFollowStatus();
  }, [currentUserId, targetUserId]);

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await unfollow(currentUserId, targetUserId);
      } else {
        await follow(currentUserId, targetUserId);
      }

      setIsFollowing((prevIsFollowing) => !prevIsFollowing);
      // Update counts after follow/unfollow action
      updateCounts(isFollowing ? -1 : 1);
    } catch (error) {
      console.error("Error toggling follow status:", error.message);
    }
  };

  return (
    <button
      onClick={handleFollowToggle}
      className={isFollowing ? "unfollow mx-auto" : "follow mx-auto"}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </button>
  );
};

export default FollowButton;
