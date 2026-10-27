
import { useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // ==========================================
  // SHORTEN URL
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent multiple clicks / requests
    if (loading) {
      return;
    }

    // Clear previous states
    setError("");
    setShortUrl("");
    setCopied(false);

    const trimmedUrl = url.trim();

    // Check empty URL
    if (!trimmedUrl) {
      setError("Please enter a URL");
      return;
    }

    // Validate URL on frontend
    try {
      new URL(trimmedUrl);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    // Start loading
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/url/shorten`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            originalUrl: trimmedUrl,
          }),
        }
      );

      const data = await response.json();

      // Handle backend error
      if (!response.ok) {
        throw new Error(
          data.message || "Failed to shorten URL"
        );
      }

      // Save shortened URL
      setShortUrl(data.data.shortUrl);

      // Clear input
      setUrl("");

    } catch (error) {
      console.error("Shorten URL error:", error);

      setError(
        error.message || "Something went wrong"
      );

    } finally {
      // Always stop loading
      setLoading(false);
    }
  };


  // ==========================================
  // COPY SHORT URL
  // ==========================================

  const handleCopy = async () => {
    if (!shortUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shortUrl);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);

    } catch (error) {
      console.error("Copy error:", error);

      setError("Failed to copy URL");
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8">

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="text-center mb-8">

          <h1 className="text-3xl font-bold text-gray-800">
            URL Shortener
          </h1>

          <p className="text-gray-500 mt-2">
            Convert your long URL into a short link
          </p>

        </div>


        {/* ==========================================
            FORM
        ========================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);

              // Remove error when user starts typing
              if (error) {
                setError("");
              }
            }}
            placeholder="https://example.com/very-long-url"
            disabled={loading}
            className="
              w-full
              px-4
              py-3
              border
              border-gray-300
              rounded-lg
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              disabled:bg-gray-100
              disabled:cursor-not-allowed
            "
          />


          {/* ==========================================
              SUBMIT BUTTON
          ========================================== */}

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="
              w-full
              py-3
              rounded-lg
              text-white
              font-semibold
              bg-blue-600
              hover:bg-blue-700
              disabled:bg-gray-400
              disabled:cursor-not-allowed
              transition
            "
          >

            {loading
              ? "Shortening..."
              : "Shorten URL"
            }

          </button>

        </form>


        {/* ==========================================
            LOADING STATE
        ========================================== */}

        {loading && (
          <div
            className="
              mt-5
              p-4
              rounded-lg
              bg-blue-50
              text-blue-700
              text-center
            "
          >
            Creating your short URL...
          </div>
        )}


        {/* ==========================================
            ERROR STATE
        ========================================== */}

        {error && !loading && (
          <div
            className="
              mt-5
              p-4
              rounded-lg
              bg-red-50
              border
              border-red-200
              text-red-600
            "
          >
            {error}
          </div>
        )}


        {/* ==========================================
            SUCCESS STATE
        ========================================== */}

        {shortUrl && !loading && (
          <div
            className="
              mt-6
              p-5
              rounded-lg
              bg-green-50
              border
              border-green-200
            "
          >

            <p className="text-green-700 font-semibold mb-3">
              URL shortened successfully!
            </p>


            {/* Short URL + Copy Button */}

            <div className="flex gap-2">

              <input
                type="text"
                value={shortUrl}
                readOnly
                className="
                  flex-1
                  px-3
                  py-2
                  border
                  border-green-300
                  rounded-lg
                  bg-white
                  text-gray-700
                "
              />


              <button
                type="button"
                onClick={handleCopy}
                className="
                  px-4
                  py-2
                  bg-green-600
                  text-white
                  rounded-lg
                  hover:bg-green-700
                "
              >
                {copied
                  ? "Copied!"
                  : "Copy"
                }
              </button>

            </div>


            {/* Open Short URL */}

            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="
                block
                mt-4
                text-center
                text-blue-600
                hover:underline
              "
            >
              Open Short URL
            </a>

          </div>
        )}

      </div>

    </div>
  );
}

export default App;

