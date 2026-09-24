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
  CheckCircle2,
  Zap,
  ShieldAlert,
  Sun,
  MessageSquare,
  Vote
} from "lucide-react";

export function TestNavigationPage() {
  const playerScreens = [
    {
      code: "P-01",
      path: "/player",
      name: "Tham gia phòng (Player Join)",
      desc: "Nhập mã phòng, chọn 1 trong 8 đội, nhập tên đại diện.",
      icon: Users,
      badge: "Mobile 360px+",
    },
    {
      code: "P-02",
      path: "/player/lobby",
      name: "Phòng chờ đội chơi (Player Lobby)",
      desc: "Hiển thị đội của mình, danh sách 8 đội trong lớp, trạng thái kết nối.",
      icon: Users,
      badge: "Mobile 360px+",
    },
    {
      code: "P-03",
      path: "/player/role",
      name: "Mở niêm phong vai trò (Role Reveal)",
      desc: "Chạm mở phong bì sáp bảo mật, xem vai trò, kỹ năng, lời dặn của Bác.",
      icon: Lock,
      badge: "Mobile 360px+",
      sublinks: [
        { label: "Thanh Tra", path: "/player/role/INSPECTOR" },
        { label: "Người Vụ Lợi", path: "/player/role/CORRUPTOR" },
        { label: "Pháp Luật", path: "/player/role/LAW" },
        { label: "Người Tố Giác", path: "/player/role/WHISTLEBLOWER" },
        { label: "Cơ Quan Giám Sát", path: "/player/role/OVERSIGHT" },
        { label: "Giám Sát Tài Sản", path: "/player/role/SPECIAL_6" },
        { label: "Minh Bạch Thông Tin", path: "/player/role/SPECIAL_7" },
      ],
    },
    {
      code: "P-04",
      path: "/player/night/question",
      name: "Thử thách tri thức ban đêm (Night Question)",
      desc: "4 nút đáp án A, B, C, D to bản, đồng hồ đêm, xác nhận nộp bài.",
      icon: HelpCircle,
      badge: "Mobile 360px+",
    },
    {
      code: "P-05A",
      path: "/player/night/result?correct=true",
      name: "Mở khóa Năng lực (Đáp án ĐÚNG)",
      desc: "Banner xanh rực rỡ, kỹ năng sẵn sàng thực thi, giải thích chuyên đề.",
      icon: CheckCircle2,
      badge: "Mobile 360px+",
    },
    {
      code: "P-05B",
      path: "/player/night/result?correct=false",
      name: "Công dân Tạm thời (Đáp án SAI)",
      desc: "Khóa kỹ năng trong đêm, giữ nguyên vai trò gốc, cơ hội mở khóa lại ở đêm sau.",
      icon: Lock,
      badge: "Mobile 360px+",
    },
    {
      code: "P-06",
      path: "/player/night/ability",
      name: "Thực thi Quyền năng Đêm (Ability Action)",
      desc: "Lưới 8 đội mục tiêu, chọn mục tiêu thi hành, modal xác nhận bảo mật.",
      icon: Zap,
      badge: "Mobile 360px+",
    },
    {
      code: "P-06-C",
      path: "/player/night/observe",
      name: "Quan sát Đêm (Chế độ Công dân)",
      desc: "Góc nhìn đêm yên bình cho đội trả lời sai câu hỏi tri thức.",
      icon: Moon,
      badge: "Mobile 360px+",
    },
    {
      code: "P-07",
      path: "/player/night/private-result?status=suspicious",
      name: "Kết quả Mật Riêng tư (Có dấu hiệu đáng ngờ)",
      desc: "Báo cáo điều tra tuyệt mật, cảnh báo nguy cơ, hướng dẫn chiến thuật thảo luận.",
      icon: ShieldAlert,
      badge: "Mobile 360px+",
    },
    {
      code: "P-07-S",
      path: "/player/night/private-result?status=safe",
      name: "Kết quả Mật Riêng tư (Chưa phát hiện dấu hiệu)",
      desc: "Báo cáo điều tra an toàn, hướng dẫn bảo vệ và điều tra các đối tượng khác.",
      icon: CheckCircle2,
      badge: "Mobile 360px+",
    },
    {
      code: "P-08",
      path: "/player/day/result",
      name: "Báo cáo Ban ngày (Day Result)",
      desc: "Thang đo Niềm tin, hồ sơ manh mối công khai, chuẩn bị tranh luận.",
      icon: Sun,
      badge: "Mobile 360px+",
    },
    {
      code: "P-09",
      path: "/player/day/discussion",
      name: "Phiên Tranh luận & Đối chất (Discussion Stage)",
      desc: "Đồng hồ 90s, hồ sơ bí mật, chiến thuật phản biện, ngân hàng câu chất vấn, sẵn sàng bỏ phiếu.",
      icon: MessageSquare,
      badge: "Mobile 360px+",
    },
    {
      code: "P-10",
      path: "/player/vote",
      name: "Phiên Bỏ phiếu Bất tín nhiệm (Voting Ballot)",
      desc: "Đồng hồ 45s, lưới ứng viên, chọn lý do biểu quyết, modal xác nhận, biên nhận niêm phong.",
      icon: Vote,
      badge: "Mobile 360px+",
    },
  ];

  const hostScreens = [
    {
      code: "H-01",
      path: "/host",
      name: "Phòng chờ Giảng viên (Host Lobby)",
      desc: "Mã phòng khổng lồ, bảng mã QR, trạng thái đèn online 8 đội.",
      icon: Monitor,
      badge: "Projector 1080p",
    },
    {
      code: "H-02",
      path: "/host/role-reveal",
      name: "Giai đoạn Mở niêm phong vai trò (Role Reveal Stage)",
      desc: "Hướng dẫn bảo mật cho cả lớp, theo dõi tiến độ xem vai trò của 8 đội.",
      icon: Lock,
      badge: "Projector 1080p",
    },
    {
      code: "H-03",
      path: "/host/night",
      name: "Trình chiếu Câu hỏi Ban đêm (Night Stage)",
      desc: "Bảng câu hỏi khổng lồ, đồng hồ đếm ngược, thang đo Niềm tin, tiến độ nộp bài.",
      icon: Moon,
      badge: "Projector 1080p",
    },
    {
      code: "H-04",
      path: "/host/day-result",
      name: "Sân khấu Báo cáo Vụ án Ban ngày (Day Result Stage)",
      desc: "Trình chiếu bình minh, công bố manh mối công khai, thang đo Niềm tin toàn lớp.",
      icon: Sun,
      badge: "Projector 1080p",
    },
    {
      code: "H-05",
      path: "/host/discussion",
      name: "Sân khấu Tranh luận Toàn lớp (Discussion Stage)",
      desc: "Đồng hồ 90s, chế độ Tâm điểm Đang phát biểu, chọn ngẫu nhiên đội, điều phối tranh luận.",
      icon: MessageSquare,
      badge: "Projector 1080p",
    },
    {
      code: "H-06",
      path: "/host/voting",
      name: "Sân khấu Bỏ phiếu Tín nhiệm Toàn lớp (Voting Stage)",
      desc: "Đồng hồ 45s đếm ngược, hòm phiếu điện tử trực tiếp, theo dõi tiến độ nộp phiếu 8 đội.",
      icon: Vote,
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

