interface ContentAreaProps {
  children?: React.ReactNode;
}

export const ContentArea = ({ children }: ContentAreaProps) => {
  return (
    <main className="flex-1 overflow-auto bg-background p-6">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
        {children}
      </div>
    </main>
  );
};
