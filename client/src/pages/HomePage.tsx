import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#1c2940,#070b14_60%)] p-6">
      <section className="w-full max-w-xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-trust">Classroom Game</p>
        <h1 className="text-4xl font-black tracking-tight sm:text-6xl">ĐÊM NIỀM TIN</h1>
        <p className="mx-auto mt-5 max-w-md text-slate-300">
          Nền tảng đã sẵn sàng. Chọn loại thiết bị để kiểm tra kết nối thời gian thực.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link className="rounded-xl bg-trust px-6 py-4 font-bold text-slate-950" to="/host">
            MỞ HOST
          </Link>
          <Link className="rounded-xl border border-slate-600 bg-slate-900 px-6 py-4 font-bold" to="/player">
            MỞ PLAYER
          </Link>
        </div>
      </section>
    </main>
  );
}
