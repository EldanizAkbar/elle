import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, child, set, get } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA4PPLmCW6jFMU-Bdw_EdvYtIifqa8XbYI",
  authDomain: "social-app-cf23c.firebaseapp.com",
  projectId: "social-app-cf23c",
  storageBucket: "social-app-cf23c.appspot.com",
  messagingSenderId: "1016478325906",
  appId: "1:1016478325906:web:7924c26c0270f883645a4b",
  databaseURL:
    "https://social-app-cf23c-default-rtdb.europe-west1.firebasedatabase.app",
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);

export async function signUp({ fullName, email, password, address, bio }) {
  const newUserKey = push(child(ref(db), "/users")).key;

  const data = await get(ref(db, "/users"));
  if (!data.val()) {
    await set(ref(db, "/users/" + newUserKey), {
      fullName,
      email,
      password,
      address,
      bio,
      followers: [],
      following: [],
      posts: [],
    });

    localStorage.setItem("user", newUserKey);
  } else {
    const users = data.val();
    const emails = Object.keys(users).map((key) => users[key].email);
    if (emails.includes(email)) {
      throw new Error("Email is already registered");
    }

    await set(ref(db, "/users/" + newUserKey), {
      fullName,
      email,
      password,
      address,
      bio,
      followers: [],
      following: [],
      posts: [],
    });

    localStorage.setItem("user", newUserKey);
  }
}

export async function login({ email, password }) {
  let snapshot = await get(ref(db, `/users`));
  let flag = true;
  const users = Object.entries(snapshot.val());

  users.map((u) => {
    const [key, user] = u;

    if (user.email === email && user.password === password) {
      localStorage.setItem("user", key);
      flag = false;
      return (window.location.href = "./");
    }
    return;
  });
  if (flag) {
    throw new Error("Wrong email or password");
  }
}

export async function getProfileInfo(userId) {
  const snapshot = await get(ref(db, "/users/" + userId));
  const userData = snapshot.val();
  return { userId, ...userData }; 
}


export async function searchUsers(query) {
  const usersRef = ref(db, "/users");
  const snapshot = await get(usersRef);

  const users = snapshot.val();
  const matchingUsers = [];

  if (users) {
    Object.keys(users).forEach((userId) => {
      const user = users[userId];

      if (user.fullName.toLowerCase().includes(query.toLowerCase())) {
        matchingUsers.push({ id: userId, ...user });
      }
    });
  }

  return matchingUsers;
}

export async function follow(followerId, followingId) {
  const snapshot1 = await get(ref(db, "/users/" + followerId));
  const snapshot2 = await get(ref(db, "/users/" + followingId));

  if (!snapshot1.exists() || !snapshot2.exists()) {
    return;
  }

  const followings = snapshot1.val().followings || [];
  const followers = snapshot2.val().followers || [];

  if (!followings.includes(followingId)) {
    followings.push(followingId);
  }

  if (!followers.includes(followerId)) {
    followers.push(followerId);
  }

  await set(ref(db, "/users/" + followerId + "/followings"), followings);
  await set(ref(db, "/users/" + followingId + "/followers"), followers);
}

export async function unfollow(followerId, followingId) {
  const snapshot1 = await get(ref(db, "/users/" + followerId));
  const snapshot2 = await get(ref(db, "/users/" + followingId));

  if (!snapshot1.exists() || !snapshot2.exists()) {
    console.log("User does not exist");
    return;
  }

  let followings = snapshot1.val().followings || [];
  let followers = snapshot2.val().followers || [];

  followings = followings.filter((el) => el !== followingId);
  followers = followers.filter((el) => el !== followerId);

  await set(ref(db, "/users/" + followerId + "/followings"), followings);
  await set(ref(db, "/users/" + followingId + "/followers"), followers);
}

export async function getFollowStatus(followerId, followingId) {
  const snapshot = await get(ref(db, `/users/${followerId}/followings`));
  const followings = snapshot.val() || [];
  return followings.includes(followingId);
}

export async function post({ content, date, author, likes, authorName }) {
  const newKey = push(ref(db, "/posts")).key;
  await set(ref(db, "/posts/" + newKey), {
    content,
    date,
    author,
    likes: [],
    authorName,
  });

  const snapshot = await get(ref(db, "/users/" + author + "/posts"));
  if (!snapshot.exists()) {
    await set(ref(db, "/users/" + author + "/posts"), [newKey]);
  } else {
    const posts = snapshot.val();
    posts.push(newKey);
    await set(ref(db, "/users/" + author + "/posts"), posts);
  }
}

export async function getPosts() {
  const snapshot = await get(ref(db, "/posts"));
  const postsObject = snapshot.val();

  if (postsObject) {
    // Convert the posts object to an array
    const postsArray = Object.keys(postsObject).map((key) => ({
      key,
      ...postsObject[key],
    }));
    // Reverse the array to display the latest posts first
    return postsArray.reverse();
  } else {
    return [];
  }
}

export async function likePost(postId, likedUsers) {
  try {
    const postRef = ref(db, `/posts/${postId}/likes`);
    await set(postRef, likedUsers);
    console.log("Like updated successfully");
  } catch (error) {
    console.error("Error updating like:", error.message);
  }
}

export async function comment({ content, date, postid, author }) {
  const newCommentRef = push(ref(db, "/comments"));

  const newKey = newCommentRef.key;

  const { fullName: authorName } = await getProfileInfo(author);

  await set(ref(db, "/comments/" + newKey), {
    content,
    date,
    postid,
    author,
    authorName,
  });

  const postCommentsRef = ref(db, "/posts/" + postid + "/comments");
  const snapshot = await get(postCommentsRef);

  if (!snapshot.exists()) {
    await set(postCommentsRef, [newKey]);
  } else {
    const comments = snapshot.val();
    comments.push(newKey);
    await set(postCommentsRef, comments);
  }
}

export async function getComments(postId, limit = -1) {
  const postCommentsRef = ref(db, `/posts/${postId}/comments`);
  const snapshot = await get(postCommentsRef);

  if (!snapshot.exists()) {
    console.log("No comments found");
    return [];
  }

  const commentKeys = snapshot.val();

  if (!commentKeys || commentKeys.length === 0) {
    console.log("No comment keys found");
    return [];
  }

  let comments = [];

  for (const commentKey of commentKeys) {
    const commentSnapshot = await get(ref(db, `/comments/${commentKey}`));

    if (commentSnapshot.exists()) {
      comments.push(commentSnapshot.val());
    }
  }

  if (limit > -1) {
    return comments.slice(0, limit);
  }

  return comments;
}
