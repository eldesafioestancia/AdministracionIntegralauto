export default function Logo({ size = "default" }: { size?: "small" | "default" | "large" }) {
  const sizeMap = {
    small: "h-8 w-8",
    default: "h-12 w-12",
    large: "h-20 w-20",
  };

  return (
    <div className="flex flex-col items-center">
      <img
        src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&h=150&q=80"
        alt="AgroGest Logo"
        className={`${sizeMap[size]} rounded-xl mb-2`}
      />
      <h1 className="font-header font-bold text-primary">AgroGest</h1>
    </div>
  );
}
