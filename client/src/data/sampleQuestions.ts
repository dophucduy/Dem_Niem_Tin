import { QuestionDifficulty } from "@dem-niem-tin/shared";

export interface GameQuestion {
  id: string;
  category: string;
  difficulty: QuestionDifficulty;
  text: string;
  options: string[];
  correctOption: number; // 0-indexed
  explanation: string;
}

export const SAMPLE_QUESTIONS: GameQuestion[] = [
  {
    id: "q-01",
    category: "Tư tưởng Hồ Chí Minh về Nhà nước của Nhân dân",
    difficulty: "easy",
    text: "Theo tư tưởng Hồ Chí Minh, cán bộ, đảng viên trong bộ máy Nhà nước phải xác định vị thế của mình đối với nhân dân như thế nào?",
    options: [
      "Là người cai trị và lãnh đạo tối cao của nhân dân",
      "Là người công bộc, là người đầy tớ trung thành của nhân dân",
      "Là tầng lớp trí thức có quyền quyết định thay cho nhân dân",
      "Là người quản lý phân phát quyền lợi cho nhân dân",
    ],
    correctOption: 1,
    explanation:
      "Chủ tịch Hồ Chí Minh căn dặn: 'Cán bộ từ Trung ương đến làng đều là công bộc của dân, nghĩa là để gánh việc chung cho dân, chứ không phải để đè đầu dân'. Mọi quyền lực của cán bộ đều bắt nguồn từ sự ủy thác của nhân dân.",
  },
  {
    id: "q-02",
    category: "Công tác Xây dựng Đảng & Kiểm soát Quyền lực",
    difficulty: "medium",
    text: "Để giữ gìn Đảng thật trong sạch, vững mạnh và ngăn ngừa tha hóa quyền lực, Chủ tịch Hồ Chí Minh coi vũ khí sắc bén nhất là gì?",
    options: [
      "Kỷ luật nghiêm khắc tuyệt đối không khoan nhượng",
      "Tự phê bình và phê bình thường xuyên như rửa mặt mỗi ngày",
      "Gia tăng tối đa số lượng văn bản và quy định quản lý",
      "Bí mật tuyệt đối mọi sai phạm trong nội bộ Đảng",
    ],
    correctOption: 1,
    explanation:
      "Người chỉ rõ: 'Một Đảng mà giấu giếm khuyết điểm của mình là một Đảng hỏng. Một Đảng có gan thừa nhận khuyết điểm của mình, vạch rõ những cái đó... rồi tìm kiếm mọi cách để sửa chữa khuyết điểm đó. Như thế là một Đảng tiến bộ, mạnh dạn, chắc chắn, chân chính'. Tự phê bình và phê bình là quy luật phát triển của Đảng.",
  },
  {
    id: "q-03",
    category: "Phòng, chống Tham ô, Lãng phí & Tiêu cực",
    difficulty: "medium",
    text: "Hồ Chí Minh đã ví tệ tham ô, lãng phí và bệnh quan liêu nguy hiểm như thứ giặc nào?",
    options: [
      "Giặc ngoại xâm từ biên giới",
      "Giặc dốt và nghèo nàn lạc hậu",
      "Giặc ở trong lòng, là bạn đồng minh của thực dân phong kiến",
      "Kẻ thù vô hình không thể trừ bỏ",
    ],
    correctOption: 2,
    explanation:
      "Trong bài viết 'Thực hành tiết kiệm, chống tham ô, lãng phí, chống bệnh quan liêu' (1952), Người nhấn mạnh: Tham ô, lãng phí, quan liêu là thứ 'giặc ở trong lòng', nó phá hoại tinh thần và vật chất của nhân dân từ bên trong, nguy hiểm không kém gì giặc ngoại xâm.",
  },
  {
    id: "q-04",
    category: "Thượng tôn Pháp luật & Củng cố Niềm tin",
    difficulty: "hard",
    text: "Trong công tác phòng chống tham nhũng hiện nay, nguyên tắc cốt lõi nào thể hiện sự nghiêm minh của pháp luật và củng cố vững chắc niềm tin của nhân dân?",
    options: [
      "Không có vùng cấm, không có ngoại lệ, bất kể người đó là ai",
      "Ưu tiên xử lý nội bộ, hạn chế công khai để giữ uy tín",
      "Chỉ xử lý đối với những vụ án có hậu quả kinh tế đặc biệt lớn",
      "Tập trung xử lý hành vi nhưng giảm nhẹ trách nhiệm của người đứng đầu",
    ],
    correctOption: 0,
    explanation:
      "Quan điểm chỉ đạo xuyên suốt của Đảng và Nhà nước là: Phòng, chống tham nhũng, tiêu cực 'không có vùng cấm, không có ngoại lệ, bất kể người đó là ai', thực thi pháp luật nghiêm minh, công bằng, công khai, từ đó củng cố sâu sắc niềm tin của nhân dân vào chế độ và pháp luật.",
  },
];

