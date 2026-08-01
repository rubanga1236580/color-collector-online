import { useEffect, useRef } from "react";

declare global {
  interface Window {
    atOptions: any;
  }
}

export default function Advertisement() {
  const containerRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    if (!containerRef.current) return;

    containerRef.current.innerHTML = "";

    window.atOptions = {
      key: "405786621168c787ed6da2ed3b1b8075",
      format: "iframe",
      height: 90,
      width: 728,
      params: {},
    };

    const script = document.createElement("script");
    script.src =
      "https://www.highperformanceformat.com/405786621168c787ed6da2ed3b1b8075/invoke.js";
    script.async = true;

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "728px",
        maxWidth: "100%",
        margin: "20px auto",
        display: "flex",
        justifyContent: "center",
      }}
    />
  );
}