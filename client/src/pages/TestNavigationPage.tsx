import React from "react";
import { Link } from "react-router-dom";
import { 
  Smartphone, 
  Monitor, 
  Sparkles, 
  Compass, 
  ArrowRight,
  Shield,
  HelpCircle,
  Users,
  Lock,
  Moon,
  CheckCircle2
} from "lucide-react";

export function TestNavigationPage() {
  const playerScreens = [
    {
      code: "P-01",
      path: "/test/p01",
      name: "Tham gia phòng (Player Join)",
      desc: "Nhập mã phòng, chọn 1 trong 8 đội, nhập tên đại diện.",
      icon: Users,
      badge: "Mobile 360px+",
    },
    {
      code: "P-02",
      path: "/test/p02",
      name: "Phòng chờ đội chơi (Player Lobby)",
      desc: "Hiển thị đội của mình, danh sách 8 đội trong lớp, trạng thái kết nối.",
      icon: Users,
      badge: "Mobile 360px+",
    },
    {
      code: "P-03",
      path: "/test/p03",
      name: "Mở niêm phong vai trò (Role Reveal)",
      desc: "Chạm mở phong bì sáp bảo mật, xem vai trò, kỹ năng, lời dặn của Bác.",
      icon: Lock,
      badge: "Mobile 360px+",
      sublinks: [
        { label: "Thanh Tra", path: "/test/p03/INSPECTOR" },
        { label: "Người Vụ Lợi", path: "/test/p03/CORRUPTOR" },
        { label: "Pháp Luật", path: "/test/p03/LAW" },
        { label: "Người Tố Giác", path: "/test/p03/WHISTLEBLOWER" },
        { label: "Cơ Quan Giám Sát", path: "/test/p03/OVERSIGHT" },
        { label: "Giám Sát Tài Sản", path: "/test/p03/SPECIAL_6" },
        { label: "Minh Bạch Thông Tin", path: "/test/p03/SPECIAL_7" },
      ],
    },
    {
      code: "P-04",
      path: "/test/p04",
      name: "Thử thách tri thức ban đêm (Night Question)",
      desc: "4 nút đáp án A, B, C, D to bản, đồng hồ đêm, xác nhận nộp bài.",
      icon: HelpCircle,
      badge: "Mobile 360px+",
    },
    {
      code: "P-05A",
      path: "/test/p05a",
      name: "Mở khóa Năng lực (Đáp án ĐÚNG)",
      desc: "Banner xanh rực rỡ, kỹ năng sẵn sàng thực thi, giải thích chuyên đề.",
      icon: CheckCircle2,
      badge: "Mobile 360px+",
    },
    {
      code: "P-05B",
      path: "/test/p05b",
      name: "Công dân Tạm thời (Đáp án SAI)",
      desc: "Khóa kỹ năng trong đêm, giữ nguyên vai trò gốc, cơ hội mở khóa lại ở đêm sau.",
      icon: Lock,
      badge: "Mobile 360px+",
    },
  ];

  const hostScreens = [
    {
      code: "H-01",
      path: "/test/h01",
      name: "Phòng chờ Giảng viên (Host Lobby)",
      desc: "Mã phòng khổng lồ, bảng mã QR, trạng thái đèn online 8 đội.",
      icon: Monitor,
      badge: "Projector 1080p",
    },
    {
      code: "H-02",
      path: "/test/h02",
      name: "Giai đoạn Mở niêm phong vai trò (Role Reveal Stage)",
      desc: "Hướng dẫn bảo mật cho cả lớp, theo dõi tiến độ xem vai trò của 8 đội.",
      icon: Lock,
      badge: "Projector 1080p",
    },
    {
      code: "H-03",
      path: "/test/h03",
      name: "Trình chiếu Câu hỏi Ban đêm (Night Stage)",
      desc: "Bảng câu hỏi khổng lồ, đồng hồ đếm ngược, thang đo Niềm tin, tiến độ nộp bài.",
      icon: Moon,
      badge: "Projector 1080p",
    },
  ];

  return (
    <main className="min-h-screen py-10 px-4 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-trust-500/10 border border-trust-500/30 text-trust-400 text-xs font-bold uppercase tracking-widest">
          <Compass className="w-3.5 h-3.5" />
          Điều hướng URL Trực tiếp • Test UI/UX
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-wide">
          TRUNG TÂM KIỂM THỬ GIAO DIỆN
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Bạn có thể gõ trực tiếp các đường dẫn URL trên thanh địa chỉ trình duyệt để kiểm tra từng màn hình độc lập.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Column 1: Player Screens */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-night-700">
            <Smartphone className="w-5 h-5 text-justice-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              1. Giao diện Người chơi (Player Mobile)
            </h2>
          </div>

          <div className="space-y-3">
            {playerScreens.map((screen) => {
              const Icon = screen.icon;
              return (
                <div
                  key={screen.code}
                  className="glass-panel-elevated rounded-2xl p-4 sm:p-5 border border-night-700 hover:border-justice-500/50 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-night-950 border border-night-700 text-justice-400">
                      {screen.code}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {screen.badge}
                    </span>
                  </div>

                  <div>
                    <Link
                      to={screen.path}
                      className="text-base font-bold text-white hover:text-justice-300 flex items-center justify-between group"
                    >
                      <span>{screen.name}</span>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-justice-400 group-hover:translate-x-1 transition-all" />
                    </Link>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {screen.desc}
                    </p>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs">
                    <code className="text-[11px] font-mono text-slate-400 bg-night-900 px-2 py-0.5 rounded border border-night-800">
                      {screen.path}
                    </code>
                    <Link
                      to={screen.path}
                      className="font-bold text-justice-400 hover:underline text-xs"
                    >
                      Mở test &rarr;
                    </Link>
                  </div>

                  {screen.sublinks && (
                    <div className="pt-2 border-t border-night-800 flex flex-wrap gap-1.5">
                      <span className="text-[10px] text-slate-500 w-full mb-0.5">
                        Test nhanh từng vai trò:
                      </span>
                      {screen.sublinks.map((sub) => (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          className="px-2 py-1 rounded bg-night-900 hover:bg-night-800 border border-night-700 text-[11px] font-semibold text-slate-300 hover:text-white"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Column 2: Host Screens */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-night-700">
            <Monitor className="w-5 h-5 text-trust-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              2. Giao diện Giảng viên (Host Projector)
            </h2>
          </div>

          <div className="space-y-3">
            {hostScreens.map((screen) => {
              const Icon = screen.icon;
              return (
                <div
                  key={screen.code}
                  className="glass-panel-elevated rounded-2xl p-4 sm:p-5 border border-night-700 hover:border-trust-500/50 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-night-950 border border-night-700 text-trust-400">
                      {screen.code}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {screen.badge}
                    </span>
                  </div>

                  <div>
                    <Link
                      to={screen.path}
                      className="text-base font-bold text-white hover:text-trust-300 flex items-center justify-between group"
                    >
                      <span>{screen.name}</span>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-trust-400 group-hover:translate-x-1 transition-all" />
                    </Link>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {screen.desc}
                    </p>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs">
                    <code className="text-[11px] font-mono text-slate-400 bg-night-900 px-2 py-0.5 rounded border border-night-800">
                      {screen.path}
                    </code>
                    <Link
                      to={screen.path}
                      className="font-bold text-trust-400 hover:underline text-xs"
                    >
                      Mở test &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Footer hint */}
      <div className="text-center text-xs text-slate-500 pt-6">
        Bạn có thể copy đường dẫn bất kỳ hoặc gõ trực tiếp lên thanh URL của trình duyệt để test.
      </div>
    </main>
  );
}

