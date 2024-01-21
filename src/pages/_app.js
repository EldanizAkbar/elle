import "@/styles/globals.css";
import { useEffect } from "react";
import { useRouter } from "next/router";

function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const isLogin =
      typeof window !== "undefined" && localStorage.getItem("user");

    if (
      !isLogin &&
      router.pathname !== "/login" &&
      router.pathname !== "/register" &&
      router.pathname !== "/"
    ) {
      router.push("/login");
    }
  }, [router.pathname]);

  return <Component {...pageProps} />;
}

export default App;
