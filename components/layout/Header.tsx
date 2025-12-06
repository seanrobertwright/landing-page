import Image from "next/image";

export const Header = () => {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-4">
        {/* Space for future search/actions */}
      </div>
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-foreground">
          LRIL Landing Page
        </h1>
        <Image
          src="/hw2.jpg"
          alt="LRIL Logo"
          width={36}
          height={36}
          className="rounded-md"
          priority
        />
      </div>
    </header>
  );
};
