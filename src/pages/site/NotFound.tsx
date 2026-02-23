import { TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 border-b border-zinc-800">
      <TriangleAlert className="text-[#1b68ea] text-6xl mb-4" />
      <h1 className="text-2xl md:text-3xl font-bold text-[#0077B6]  mb-2">
        {"#Error 404 – Whoopsie! Something ain't right here"}
      </h1>
      <h2 className="text-lg md:text-xl text-black/30  mb-2">
        {"Come on Dorothy, let's take you back to Emerald City"}
      </h2>
      <p className="text-black/30 italic mb-6">{"there's no place like"}</p>

      <Link
        to="/"
        aria-label="Go Back"
        className="text-white bg-[#0077B6] rounded-md px-4 py-2 font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007fff]"
      >
        Home
      </Link>
    </section>
  );
};

export default NotFound;
