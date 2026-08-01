import AdBanner from "./AdBanner";

export default function Advertisement() {
  return (
    <div
      style={{
        width: 300,
        margin: "20px auto",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <AdBanner />
    </div>
  );
}