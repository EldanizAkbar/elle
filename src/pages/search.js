import React, { useState, useEffect } from "react";
import Header from "../components/header";
import { searchUsers } from "../lib/firebase/index";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";

const Search = () => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [noResults, setNoResults] = useState(false);
  const defaultUserImage = "/profile-picture.png";

  useEffect(() => {
    const userId = localStorage.getItem("user");
    setCurrentUserId(userId);
  }, []);

  const handleSearch = async () => {
    try {
      const results = await searchUsers(query);
      const filteredResults = results.filter(
        (user) => user.id !== currentUserId
      );

      setSearchResults(filteredResults);
      setNoResults(filteredResults.length === 0);
    } catch (error) {
      console.error("Error searching users:", error.message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <>
      <Head>
        <title>Search Users</title>
      </Head>
      <Header />
      <div className="container mx-auto mt-8 p-4 bg-white rounded-lg shadow-lg search_container">
        <h1 className="text-3xl font-bold mb-4">User Search</h1>

        <div className="flex items-center">
          <div className="relative mb-4 flex flex-wrap items-stretch search_bar mx-auto">
            <input
              type="search"
              className="mt-5 search_input relative m-0 -mr-0.5 block min-w-0 flex-auto rounded-l border border-solid border-neutral-300 bg-transparent bg-clip-padding px-3 py-[0.25rem] text-base font-normal leading-[1.6] text-neutral-700 outline-none transition duration-200 ease-in-out focus:z-[3] focus:border-primary focus:text-neutral-700 focus:shadow-[inset_0_0_0_1px_rgb(59,113,202)] focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:placeholder:text-neutral-200 dark:focus:border-primary"
              placeholder="Search users by full name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              aria-label="Search"
              aria-describedby="button-addon3"
            />
            <button
              className="mt-5 mx-auto search_btn relative z-[2] rounded-r border-2 border-primary px-6 py-2 text-xs font-medium uppercase text-primary 
                         transition duration-150 ease-in-out hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0"
              type="button"
              id="button-addon3"
              data-te-ripple-init=""
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
        </div>

        {noResults && (
          <p className="text-lg font-bold mt-4 text-grey-500 text-center">
            <i>No users found</i>
          </p>
        )}

        {searchResults.length > 0 && (
          <ul className="mt-6 users_conatiner mx-auto">
            {searchResults.map((user) => (
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
                      href={`/${user.id}`}
                      className="text-blue-500 view_profile_btn"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default Search;
