import mongoose from "mongoose";
import { env } from "../config/env.js";

type IndexDefinition = {
  keys: Record<string, 1 | -1>;
  options?: {
    name?: string;
    unique?: boolean;
    sparse?: boolean;
  };
};

const collections: Record<string, IndexDefinition[]> = {
  rooms: [
    { keys: { roomCode: 1 }, options: { name: "roomCode_unique", unique: true } },
    { keys: { status: 1, updatedAt: -1 }, options: { name: "status_updatedAt" } },
  ],
  games: [
    { keys: { roomId: 1 }, options: { name: "roomId_unique", unique: true } },
    { keys: { roomCode: 1 }, options: { name: "roomCode" } },
    { keys: { status: 1, updatedAt: -1 }, options: { name: "status_updatedAt" } },
  ],
  players: [
    { keys: { roomId: 1, teamId: 1 }, options: { name: "roomId_teamId_unique", unique: true } },
    {
      keys: { roomId: 1, sessionTokenHash: 1 },
      options: { name: "roomId_sessionTokenHash_unique", unique: true },
    },
  ],
  teams: [
    { keys: { roomId: 1, teamNumber: 1 }, options: { name: "roomId_teamNumber_unique", unique: true } },
  ],
  questions: [
    { keys: { text: 1 }, options: { name: "question_text_unique", unique: true } },
    { keys: { category: 1, difficulty: 1 }, options: { name: "category_difficulty" } },
  ],
  actions: [
    { keys: { gameId: 1, round: 1, playerId: 1 } },
    { keys: { gameId: 1, createdAt: 1 }, options: { name: "game_createdAt" } },
  ],
  votes: [
    {
      keys: { gameId: 1, round: 1, voterId: 1 },
      options: { unique: true },
    },
    { keys: { gameId: 1, round: 1, targetId: 1 }, options: { name: "vote_tally" } },
  ],
  clues: [
    { keys: { gameId: 1, visibility: 1, revealedAt: 1 }, options: { name: "game_visibility_revealedAt" } },
  ],
  gameevents: [
    { keys: { gameId: 1, timestamp: 1 }, options: { name: "game_timestamp" } },
    { keys: { gameId: 1, visibility: 1 }, options: { name: "game_visibility" } },
  ],
};

const obsoleteIndexes: Record<string, string[]> = {
  games: ["roomCode_unique"],
  players: ["gameId_teamId_unique", "gameId_sessionTokenHash_unique"],
  teams: ["gameId_teamNumber_unique"],
  questions: ["questionId_unique"],
  actions: ["game_round_player"],
  votes: ["one_vote_per_round", "vote_tally", "gameId_1_round_1_playerId_1", "gameId_1_round_1_targetTeamId_1"],
};

// ─────────────────────────────────────────────────────────────────────────────
// Câu hỏi kiến thức — Chương 4 Tư tưởng Hồ Chí Minh
// 4.2.3 Nhà nước trong sạch, vững mạnh
// 4.3.1 Xây dựng Đảng thật sự trong sạch, vững mạnh
// 4.3.2 Xây dựng Nhà nước
// 4.3.3 Phòng, chống tham nhũng góp phần củng cố niềm tin nhân dân
// ─────────────────────────────────────────────────────────────────────────────
const starterQuestions = [
  // ── EASY (Đêm 1) ────────────────────────────────────────────────────────
  {
    category: "Nhà nước của dân",
    difficulty: "easy",
    text: "Theo Hồ Chí Minh, cán bộ nhà nước có vai trò gì đối với nhân dân?",
    options: [
      "Người lãnh đạo, cai trị nhân dân",
      "Công bộc — đầy tớ trung thành của nhân dân",
      "Đại diện của Đảng trước nhân dân",
      "Chuyên gia hướng dẫn nhân dân làm theo",
    ],
    correctAnswer: "Công bộc — đầy tớ trung thành của nhân dân",
  },
  {
    category: "Xây dựng Đảng",
    difficulty: "easy",
    text: "Hồ Chí Minh xác định phê bình và tự phê bình trong Đảng là gì?",
    options: [
      "Công cụ để tố cáo cán bộ không phục tùng",
      "Vũ khí sắc bén để xây dựng Đảng trong sạch, vững mạnh",
      "Thủ tục hành chính bắt buộc hàng năm",
      "Hình thức họp báo định kỳ của Đảng",
    ],
    correctAnswer: "Vũ khí sắc bén để xây dựng Đảng trong sạch, vững mạnh",
  },
  {
    category: "Phòng chống tham nhũng",
    difficulty: "easy",
    text: "Tham nhũng gây tác hại nguy hiểm nhất ở điểm nào theo tư tưởng Hồ Chí Minh?",
    options: [
      "Làm giảm tốc độ tăng trưởng kinh tế",
      "Làm xói mòn niềm tin của nhân dân vào Đảng, Nhà nước và chế độ",
      "Gây thất thoát lớn cho ngân sách nhà nước",
      "Làm xấu hình ảnh đất nước trên trường quốc tế",
    ],
    correctAnswer: "Làm xói mòn niềm tin của nhân dân vào Đảng, Nhà nước và chế độ",
  },
  {
    category: "Xây dựng Nhà nước",
    difficulty: "easy",
    text: "Nguyên tắc 'thượng tôn pháp luật' đòi hỏi điều gì?",
    options: [
      "Pháp luật chỉ ràng buộc người dân, không ràng buộc cơ quan nhà nước",
      "Mọi cá nhân và tổ chức đều bình đẳng trước pháp luật, không ai đứng trên pháp luật",
      "Cơ quan nhà nước có thể ban hành quy định riêng phù hợp hoàn cảnh",
      "Chỉ toà án mới cần tuân thủ nghiêm pháp luật",
    ],
    correctAnswer: "Mọi cá nhân và tổ chức đều bình đẳng trước pháp luật, không ai đứng trên pháp luật",
  },
  {
    category: "Đạo đức công vụ",
    difficulty: "easy",
    text: "Khi phát hiện xung đột lợi ích trong công việc, cán bộ cần làm gì?",
    options: [
      "Tự xử lý vì bản thân hiểu rõ nhất",
      "Báo cáo cấp trên và xin rút khỏi quyết định liên quan",
      "Nhờ người thân có chuyên môn tư vấn",
      "Tạm thời gác lại, xử lý sau khi hết nhiệm kỳ",
    ],
    correctAnswer: "Báo cáo cấp trên và xin rút khỏi quyết định liên quan",
  },

  // ── MEDIUM (Đêm 2) ───────────────────────────────────────────────────────
  {
    category: "Xây dựng Đảng",
    difficulty: "medium",
    text: "Kỷ luật Đảng theo tư tưởng Hồ Chí Minh phải được thực hiện như thế nào?",
    options: [
      "Khoan hồng với cán bộ cấp cao có nhiều đóng góp để giữ đoàn kết",
      "Nghiêm minh, công bằng, không phân biệt chức vụ hay thành tích cũ",
      "Chỉ kỷ luật khi có dư luận xã hội phản ánh mạnh",
      "Ưu tiên giáo dục, hạn chế kỷ luật để giữ ổn định nội bộ",
    ],
    correctAnswer: "Nghiêm minh, công bằng, không phân biệt chức vụ hay thành tích cũ",
  },
  {
    category: "Phòng chống tham nhũng",
    difficulty: "medium",
    text: "Theo tư tưởng Hồ Chí Minh, nguyên nhân sâu xa nhất của tham nhũng là gì?",
    options: [
      "Mức lương cán bộ chưa đủ sống, buộc phải tìm thu nhập thêm",
      "Chủ nghĩa cá nhân, suy thoái đạo đức kết hợp thiếu cơ chế kiểm soát quyền lực",
      "Pháp luật còn nhiều kẽ hở, chưa có đủ điều khoản xử phạt",
      "Người dân chưa có ý thức tố cáo, dung túng cho tham nhũng",
    ],
    correctAnswer: "Chủ nghĩa cá nhân, suy thoái đạo đức kết hợp thiếu cơ chế kiểm soát quyền lực",
  },
  {
    category: "Minh bạch",
    difficulty: "medium",
    text: "Minh bạch trong hoạt động công quyền đóng vai trò gì trong phòng chống tham nhũng?",
    options: [
      "Chỉ cần thiết ở lĩnh vực nhạy cảm như tài chính, đất đai",
      "Tạo điều kiện để nhân dân giám sát, phát hiện và tố cáo tiêu cực",
      "Dễ lộ thông tin nhạy cảm nên cần cân nhắc kỹ trước khi áp dụng",
      "Là hình thức truyền thông, không ảnh hưởng thực chất đến tham nhũng",
    ],
    correctAnswer: "Tạo điều kiện để nhân dân giám sát, phát hiện và tố cáo tiêu cực",
  },
  {
    category: "Xây dựng Nhà nước",
    difficulty: "medium",
    text: "Hồ Chí Minh quan niệm mối quan hệ giữa Nhà nước và pháp luật như thế nào?",
    options: [
      "Nhà nước có thể linh hoạt vượt trên pháp luật khi đất nước có yêu cầu đặc biệt",
      "Pháp luật là công cụ của Nhà nước, chỉ ràng buộc người bị quản lý",
      "Nhà nước quản lý xã hội bằng pháp luật và chính Nhà nước phải gương mẫu tuân thủ pháp luật",
      "Đảng lãnh đạo pháp luật, Nhà nước chỉ thực thi theo chỉ đạo của Đảng",
    ],
    correctAnswer: "Nhà nước quản lý xã hội bằng pháp luật và chính Nhà nước phải gương mẫu tuân thủ pháp luật",
  },
  {
    category: "Kiểm soát quyền lực",
    difficulty: "medium",
    text: "Kiểm soát quyền lực trong bộ máy Đảng và Nhà nước nhằm mục đích gì?",
    options: [
      "Hạn chế quyền chủ động của cán bộ cấp dưới, tập trung quyền lên cấp trên",
      "Ngăn ngừa lạm dụng quyền lực, chống tham nhũng và bảo vệ quyền lợi nhân dân",
      "Tăng cường thẩm quyền và nguồn lực cho cơ quan kiểm tra, thanh tra",
      "Giám sát việc nhân dân thực hiện đầy đủ nghĩa vụ với Nhà nước",
    ],
    correctAnswer: "Ngăn ngừa lạm dụng quyền lực, chống tham nhũng và bảo vệ quyền lợi nhân dân",
  },

  // ── HARD (Đêm 3) ─────────────────────────────────────────────────────────
  {
    category: "Phòng chống tham nhũng",
    difficulty: "hard",
    text: "Mối quan hệ giữa phòng chống tham nhũng và củng cố niềm tin nhân dân được Hồ Chí Minh xác định như thế nào?",
    options: [
      "Phòng chống tham nhũng chỉ cần thiết khi niềm tin nhân dân đã giảm sút rõ rệt",
      "Hai vấn đề độc lập, có thể ưu tiên từng vấn đề theo từng giai đoạn",
      "Phòng chống tham nhũng là điều kiện tất yếu để bảo vệ và củng cố niềm tin nhân dân vào chế độ",
      "Củng cố niềm tin quan trọng hơn — cần ưu tiên truyền thông trước, chống tham nhũng sau",
    ],
    correctAnswer: "Phòng chống tham nhũng là điều kiện tất yếu để bảo vệ và củng cố niềm tin nhân dân vào chế độ",
  },
  {
    category: "Xây dựng Đảng",
    difficulty: "hard",
    text: "Hồ Chí Minh chỉ ra rằng 'bệnh quan liêu' ở cán bộ biểu hiện nguy hiểm nhất ở điểm nào?",
    options: [
      "Giải quyết giấy tờ hành chính chậm, gây ách tắc cho người dân",
      "Không hoàn thành chỉ tiêu, kế hoạch công tác được giao",
      "Xa rời thực tế và nhân dân, ra quyết định duy ý chí gây hại cho lợi ích của dân",
      "Thiếu chuyên môn nghiệp vụ trong lĩnh vực được phân công phụ trách",
    ],
    correctAnswer: "Xa rời thực tế và nhân dân, ra quyết định duy ý chí gây hại cho lợi ích của dân",
  },
  {
    category: "Trách nhiệm giải trình",
    difficulty: "hard",
    text: "Cơ chế bảo vệ người tố cáo tham nhũng hiệu quả cần ưu tiên điều gì?",
    options: [
      "Công khai danh tính người tố cáo để tăng tính minh bạch và uy tín của vụ việc",
      "Chuyển người tố cáo sang đơn vị khác để tránh va chạm với người bị tố cáo",
      "Bảo mật danh tính, có cơ chế chống trả thù và kênh xử lý độc lập",
      "Chỉ tiếp nhận tố cáo khi có đầy đủ bằng chứng để tránh tố cáo sai sự thật",
    ],
    correctAnswer: "Bảo mật danh tính, có cơ chế chống trả thù và kênh xử lý độc lập",
  },
  {
    category: "Xây dựng Nhà nước",
    difficulty: "hard",
    text: "Để xây dựng Nhà nước pháp quyền thực sự theo tư tưởng Hồ Chí Minh, điều kiện căn bản nhất là gì?",
    options: [
      "Ban hành hệ thống pháp luật đồng bộ, đầy đủ với nhiều điều khoản chi tiết",
      "Xây dựng đội ngũ cán bộ có phẩm chất đạo đức, năng lực và tinh thần tận tụy phục vụ nhân dân",
      "Tăng cường bộ máy cưỡng chế, nâng cao chế tài xử phạt để đủ sức răn đe",
      "Học tập và áp dụng linh hoạt mô hình nhà nước pháp quyền từ các nước phát triển",
    ],
    correctAnswer: "Xây dựng đội ngũ cán bộ có phẩm chất đạo đức, năng lực và tinh thần tận tụy phục vụ nhân dân",
  },
  {
    category: "Phòng chống tham nhũng",
    difficulty: "hard",
    text: "Theo tư tưởng Hồ Chí Minh, giải pháp căn bản nhất để phòng ngừa tham nhũng từ gốc rễ là gì?",
    options: [
      "Tăng lương và chế độ đãi ngộ để cán bộ không còn động lực tham nhũng",
      "Xây dựng văn hóa liêm chính, giáo dục đạo đức cách mạng kết hợp kiểm soát quyền lực chặt chẽ",
      "Xử lý hình sự thật nặng các vụ tham nhũng để có tác dụng răn đe mạnh",
      "Thường xuyên luân chuyển cán bộ để không kịp tạo lập mạng lưới tham nhũng",
    ],
    correctAnswer: "Xây dựng văn hóa liêm chính, giáo dục đạo đức cách mạng kết hợp kiểm soát quyền lực chặt chẽ",
  },
] as const;

async function setupDatabase(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI, { dbName: env.MONGODB_DB_NAME });
  const database = mongoose.connection.db;

  if (!database) {
    throw new Error("MongoDB connection did not expose a database");
  }

  const existingCollections = new Set(
    (await database.listCollections({}, { nameOnly: true }).toArray()).map(
      (collection: { name: string }) => collection.name,
    ),
  );

  for (const [collectionName, indexes] of Object.entries(collections)) {
    if (!existingCollections.has(collectionName)) {
      await database.createCollection(collectionName);
      console.log(`Created collection: ${collectionName}`);
    } else {
      console.log(`Collection already exists: ${collectionName}`);
    }

    const collection = database.collection(collectionName);
    const existingIndexes = new Set(
      (await collection.indexes()).map((index: { name?: string }) => index.name).filter(Boolean),
    );
    for (const obsoleteIndex of obsoleteIndexes[collectionName] ?? []) {
      if (existingIndexes.has(obsoleteIndex)) {
        await collection.dropIndex(obsoleteIndex);
        console.log(`Removed obsolete index: ${collectionName}.${obsoleteIndex}`);
      }
    }

    for (const index of indexes) {
      await collection.createIndex(index.keys, index.options);
    }
  }

  const questions = database.collection("questions");
  const now = new Date();
  const questionResult = await questions.bulkWrite(
    starterQuestions.map((question) => ({
      updateOne: {
        filter: { text: question.text },
        update: {
          $set: { ...question, updatedAt: now },
          $setOnInsert: { createdAt: now },
        },
        upsert: true,
      },
    })),
  );
  console.log(
    `Questions synchronized: ${questionResult.matchedCount} updated, ${questionResult.upsertedCount} inserted`,
  );

  console.log(`Database setup complete: ${database.databaseName}`);
}

setupDatabase()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Unknown database setup error";
    console.error(`Database setup failed: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
