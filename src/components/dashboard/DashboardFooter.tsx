const DashboardFooter = () => {
  return (
    <footer className="bg-navy text-white/70 py-5 mt-10 font-body text-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-between gap-2">
        <span>The Leadership Forge · A Peck Education program</span>
        <span>© {new Date().getFullYear()} Peck Education LLC</span>
      </div>
    </footer>
  );
};

export default DashboardFooter;
