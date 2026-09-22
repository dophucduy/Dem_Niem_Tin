import { Role, Faction } from "@dem-niem-tin/shared";
import { 
  Search, 
  ShieldCheck, 
  FileWarning, 
  Eye, 
  Coins, 
  Share2, 
  Flame 
} from "lucide-react";
import React from "react";

export interface RoleInfo {
  role: Role;
  faction: Faction;
  name: string;
  subtitle: string;
  iconName: string;
  abilityName: string;
  abilityShortDesc: string;
  abilityDetail: string;
  guideNote: string;
  flavorQuote: string;
}

export const ROLE_DEFINITIONS: Record<Role, RoleInfo> = {
  INSPECTOR: {
    role: "INSPECTOR",
    faction: "TRUST",
    name: "THANH TRA",
    subtitle: "Cơ quan Thanh tra Nhà nước",
    iconName: "Search",
    abilityName: "ĐIỀU TRA BÍ MẬT",
    abilityShortDesc: "Chọn một đội để kiểm tra xem có dấu hiệu vụ lợi đáng ngờ hay không.",
    abilityDetail: "Vào ban đêm, bạn được chỉ định 1 đội để điều tra. Kết quả sẽ thông báo riêng cho bạn: 'CÓ DẤU HIỆU ĐÁNG NGỜ' hoặc 'CHƯA PHÁT HIỆN DẤU HIỆU'.",
    guideNote: "Kết quả điều tra là tuyệt mật. Hãy sử dụng thông tin khôn ngoan trong các phiên thảo luận ban ngày để định hướng công lý.",
    flavorQuote: "“Cán bộ thanh tra như cái gương cho người ta soi mặt, gương mờ thì không soi được.” — Hồ Chí Minh",
  },
  LAW: {
    role: "LAW",
    faction: "TRUST",
    name: "PHÁP LUẬT",
    subtitle: "Cán cân Công lý & Bảo vệ",
    iconName: "ShieldCheck",
    abilityName: "BẢO VỆ PHÁP LÝ",
    abilityShortDesc: "Bảo vệ một đội khỏi các tác động can thiệp tiêu cực trong đêm.",
    abilityDetail: "Mỗi đêm, bạn chọn 1 đội để che chở bằng lá chắn pháp luật. Đội được bạn bảo vệ sẽ vô hiệu hóa mọi hành vi gây nhiễu hoặc triệt hạ của Người Vụ Lợi.",
    guideNote: "Máy chủ luôn ưu tiên giải quyết lệnh bảo vệ trước khi giải quyết hành vi phá hoại.",
    flavorQuote: "“Pháp luật là chuẩn mực, là công cụ hữu hiệu nhất để bảo vệ quyền và lợi ích chính đáng của nhân dân.”",
  },
  WHISTLEBLOWER: {
    role: "WHISTLEBLOWER",
    faction: "TRUST",
    name: "NGƯỜI TỐ GIÁC",
    subtitle: "Tiếng nói Quần chúng & Nhân dân",
    iconName: "FileWarning",
    abilityName: "TIẾT LỘ MANH MỐI",
    abilityShortDesc: "Cung cấp manh mối vụ việc cho cơ quan giám sát hoặc đưa ra công luận.",
    abilityDetail: "Khi mở khóa thành công, bạn kích hoạt tạo ra một manh mối quan trọng về vụ việc, có thể xuất hiện công khai trên bảng hồ sơ vụ án hoặc gửi riêng cho cơ quan giám sát.",
    guideNote: "Dũng cảm tố giác hành vi sai trái là vũ khí sắc bén giúp thanh lọc bộ máy.",
    flavorQuote: "“Dựa vào nhân dân, phát huy tai mắt của nhân dân thì việc gì cũng làm được.”",
  },
  OVERSIGHT: {
    role: "OVERSIGHT",
    faction: "TRUST",
    name: "CƠ QUAN GIÁM SÁT",
    subtitle: "Kiểm tra & Giám sát Quyền lực",
    iconName: "Eye",
    abilityName: "XÁC MINH MANH MỐI",
    abilityShortDesc: "Thẩm tra độ xác thực của một manh mối hoặc một hành động.",
    abilityDetail: "Chọn một manh mối thu thập được để xác minh tính chuẩn xác. Giúp phân định thông tin thật - giả, tránh bị phe vụ lợi dẫn dắt dư luận sai lệch.",
    guideNote: "Kiểm soát quyền lực và thẩm tra thông tin là lá chắn ngăn chặn tha hóa quyền lực.",
    flavorQuote: "“Kiểm soát quyền lực là điều kiện tiên quyết để giữ gìn sự trong sạch của bộ máy nhà nước.”",
  },
  SPECIAL_6: {
    role: "SPECIAL_6",
    faction: "TRUST",
    name: "GIÁM SÁT TÀI SẢN",
    subtitle: "Kiểm soát Thu nhập & Lợi ích",
    iconName: "Coins",
    abilityName: "KIỂM TRA LỢI ÍCH",
    abilityShortDesc: "Kiểm tra xem một đội có phát sinh xung đột lợi ích hoặc tư lợi cá nhân hay không.",
    abilityDetail: "Kiểm tra dấu hiệu bất minh về quyền lợi cá nhân của một đội chơi. Nhận diện các dấu hiệu tư lợi núp bóng công vụ.",
    guideNote: "Minh bạch tài sản là giải pháp căn cơ để phòng ngừa tham nhũng từ sớm, từ xa.",
    flavorQuote: "“Chí công vô tư — Việc thiện dù nhỏ mấy cũng làm, việc ác dù nhỏ mấy cũng tránh.” — Hồ Chí Minh",
  },
  SPECIAL_7: {
    role: "SPECIAL_7",
    faction: "TRUST",
    name: "MINH BẠCH THÔNG TIN",
    subtitle: "Công khai & Trách nhiệm Giải trình",
    iconName: "Share2",
    abilityName: "YÊU CẦU MINH BẠCH",
    abilityShortDesc: "Yêu cầu công khai một mảnh hồ sơ vụ việc ra toàn thể lớp học.",
    abilityDetail: "Buộc một thông tin đang được giữ kín phải giải trình công khai trên màn chiếu của Host vào sáng hôm sau.",
    guideNote: "Công khai là phương thuốc hiệu nghiệm nhất để tiêu diệt mầm mống tiêu cực.",
    flavorQuote: "“Minh bạch giải trình củng cố niềm tin — Ánh sáng công lý xua tan bóng tối vụ lợi.”",
  },
  CORRUPTOR: {
    role: "CORRUPTOR",
    faction: "CORRUPTION",
    name: "NGƯỜI VỤ LỢI",
    subtitle: "Phe Tham nhũng & Can thiệp",
    iconName: "Flame",
    abilityName: "GÂY NHIỄU & CAN THIỆP",
    abilityShortDesc: "Tác động ngầm làm sai lệch hướng điều tra hoặc bào mòn niềm tin nhân dân.",
    abilityDetail: "Bạn thực hiện hành động mờ ám trong đêm nhằm gây nhiễu manh mối, làm suy giảm điểm Niềm tin nhân dân (-15%) hoặc làm sai lệch kết quả điều tra của Thanh tra.",
    guideNote: "Hãy ẩn mình khéo léo trong các phiên thảo luận và bỏ phiếu ban ngày. Nếu để bị nhận diện và đưa ra ánh sáng, phe bạn sẽ thất bại.",
    flavorQuote: "“Tham ô, lãng phí, quan liêu là một thứ 'giặc ở trong lòng', là bạn đồng minh của thực dân phong kiến.” — Hồ Chí Minh",
  },
};

