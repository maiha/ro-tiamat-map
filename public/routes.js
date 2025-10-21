// ティアマト攻城戦 西ルート - ルート定義
// このファイルに攻略ルートを追加できます

const ROUTES = {
  "gimmick_start": {
    name: "グローザ",
    color: "#9C27B0",
    description: "4将ギミック始動まで",
    path: [
      "gate1_1f",
      "tower_south1_1f",
      "tower_south1_2f",
      "tower_south1_3f",
      "tower_south1_roof",
      "gate1_roof",
      "gate1_3f"
    ]
  },
  "daehyon": {
    name: "デヒョン",
    color: "#8B4513",
    description: "デヒョン戦（ソード）",
    path: [
      "gate1_3f",
      "gate1_roof",
      "tower_south1_roof",
      "tower_south1_3f"
    ]
  },
  "hyuriel": {
    name: "ヒュリエル",
    color: "#FF0000",
    description: "ヒュリエル戦（ワンド）",
    path: [
      "tower_south1_3f",
      "tower_south1_2f",
      "wall2f_01",
      "tower_southwest_2f",
      "tower_southwest_3f"
    ]
  },
  "gioia": {
    name: "ジオイア",
    color: "#FFFF00",
    description: "ジオイア戦（コイン）",
    path: [
      "tower_southwest_roof",
      "tower_southwest_3f",
      "tower_southwest_2f",
      "tower_southwest_1f",
      "tower_southwest_2f",
      "wall2f_02",
      "tower_west_2f",
      "tower_west_1f",
      "tower_west_2f",
      "tower_west_3f",
      "tower_west_roof",
      "tower_west_3f",
      "wall_route05",
      "tower_northwest_3f"
    ]
  },
  "kades": {
    name: "カデス",
    color: "#555555",
    description: "カデス戦（カップ）",
    path: [
      "tower_northwest_3f",
      "tower_northwest_roof",
      "tower_northwest_3f",
      "wall_route07",
      "tower_north1_3f"
    ]
  }
};

// windowオブジェクトに明示的に代入（グローバルアクセス用）
window.ROUTES = ROUTES;
