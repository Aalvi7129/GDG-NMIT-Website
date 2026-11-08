"use state";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import React, { useEffect, useState } from "react";

export default function Loader({
  className = "",
  onReady,
}: {
  className?: string;
  onReady?: () => void;
}) {
  const [isLoaderReady, setIsLoaderReady] = useState(false);

  useEffect(() => {
    if (isLoaderReady && onReady) {
      onReady();
    }
  }, [isLoaderReady, onReady]);

  return (
    <div className={`flex items-center justify-center min-h-screen ${className}`}>
      <DotLottieReact
        src="/assets/loader.lottie"
        autoplay
        onLoad={() => setIsLoaderReady(true)}
      />
    </div>
  );
}
