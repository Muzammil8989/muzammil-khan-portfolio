export default function Footer() {
  return (
    <footer className="text-center py-16 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
      <p className="text-[10px] font-medium uppercase tracking-[0.3em]" style={{ color: "#3a4060" }}>
        © {new Date().getFullYear()} Muhammad Muzammil Khan • All Rights Reserved
      </p>
    </footer>
  );
}
