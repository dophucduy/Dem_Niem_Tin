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

const starterQuestions = [
  {
    category: "Đạo đức công vụ",
    difficulty: "easy",
    text: "Khi phát hiện xung đột lợi ích, hành động phù hợp nhất là gì?",
    options: ["Che giấu", "Báo cáo và xin rút khỏi quyết định", "Tự quyết định", "Nhờ người quen xử lý"],
    correctAnswer: "Báo cáo và xin rút khỏi quyết định",
  },
  {
    category: "Minh bạch",
    difficulty: "medium",
    text: "Biện pháp nào giúp giảm rủi ro tham nhũng trong mua sắm công?",
    options: ["Chỉ định thầu mọi trường hợp", "Không công bố hồ sơ", "Đấu thầu minh bạch và giám sát độc lập", "Một người phê duyệt toàn bộ"],
    correctAnswer: "Đấu thầu minh bạch và giám sát độc lập",
  },
  {
    category: "Trách nhiệm giải trình",
    difficulty: "hard",
    text: "Cơ chế bảo vệ người tố cáo hiệu quả cần ưu tiên điều gì?",
    options: ["Công khai danh tính", "Bảo mật danh tính và chống trả đũa", "Trì hoãn xử lý", "Chuyển trách nhiệm cho người tố cáo"],
    correctAnswer: "Bảo mật danh tính và chống trả đũa",
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
  if ((await questions.countDocuments()) === 0) {
    await questions.insertMany(starterQuestions.map((question) => ({ ...question, createdAt: new Date(), updatedAt: new Date() })));
    console.log(`Seeded questions: ${starterQuestions.length}`);
  }

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
