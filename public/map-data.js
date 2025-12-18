// マップデータ
const MAP_DATA = {
  "maps": [
    {
      "id": "tower_south1_1f",
      "name": "塔・南①1F",
      "floor": 1,
      "area": "tower_south1",
      "enemyType": "yellow",
      "description": "祭祀",
      "image": "images/tower_south1_1f.png"
    },
    {
      "id": "tower_south1_2f",
      "name": "塔・南①2F",
      "floor": 2,
      "area": "tower_south1",
      "enemyType": "yellow",
      "description": "祭祀",
      "image": "images/tower_south1_2f.png"
    },
    {
      "id": "tower_south1_3f",
      "name": "塔・南①3F",
      "floor": 3,
      "area": "tower_south1",
      "enemyType": "yellow",
      "description": "祭祀/ボス(デヒョン戦、ソード)",
      "image": "images/tower_south1_3f.png",
      "boss": true,
      "bossImage": "images/AB_DAEHYON.png"
    },
    {
      "id": "tower_south1_roof",
      "name": "塔・南①屋上",
      "floor": 4,
      "area": "tower_south1",
      "enemyType": "green",
      "description": "森林",
      "image": "images/tower_south1_roof.png"
    },
    {
      "id": "gate1_roof",
      "name": "城壁城門①屋上",
      "floor": 4,
      "area": "gate1",
      "enemyType": "green",
      "description": "森林",
      "image": "images/gate1_roof.png"
    },
    {
      "id": "gate1_3f",
      "name": "城門①3F",
      "floor": 3,
      "area": "gate1",
      "enemyType": "green",
      "description": "森林/4将ギミック始動/グローザ像クイズ",
      "image": "images/gate1_3f.png",
      "boss": true,
      "bossImage": "images/AB_GROZA.png"
    },
    {
      "id": "gate1_1f",
      "name": "城門①1F",
      "floor": 1,
      "area": "gate1",
      "enemyType": "yellow",
      "description": "",
      "image": "images/gate1_1f.png"
    },
    {
      "id": "wall2f_01",
      "name": "城壁2F01",
      "floor": 2,
      "area": "wall_route01",
      "enemyType": "green",
      "description": "森林/落とし穴",
      "image": "images/wall2f_01.png"
    },
    {
      "id": "wall_route01",
      "name": "城壁通路01",
      "floor": 3,
      "area": "wall_route01",
      "enemyType": "green",
      "description": "",
      "image": "images/wall_route01.png"
    },
    {
      "id": "tower_southwest_1f",
      "name": "塔・南西1F",
      "floor": 1,
      "area": "tower_southwest",
      "enemyType": "yellow",
      "description": "祭祀",
      "image": "images/tower_southwest_1f.png"
    },
    {
      "id": "tower_southwest_2f",
      "name": "塔・南西2F",
      "floor": 2,
      "area": "tower_southwest",
      "enemyType": "yellow",
      "description": "祭祀",
      "image": "images/tower_southwest_2f.png"
    },
    {
      "id": "tower_southwest_3f",
      "name": "塔・南西3F",
      "floor": 3,
      "area": "tower_southwest",
      "enemyType": "yellow",
      "description": "祭祀/ボス(ヒュリエル戦、ワンド)",
      "image": "images/tower_southwest_3f.png",
      "boss": true,
      "bossImage": "images/AB_PYURIEL.png"
    },
    {
      "id": "tower_southwest_roof",
      "name": "塔・南西屋上",
      "floor": 4,
      "area": "tower_southwest",
      "enemyType": "green",
      "description": "森林",
      "image": "images/tower_southwest_roof.png"
    },
    {
      "id": "wall2f_02",
      "name": "城壁2F02",
      "floor": 2,
      "area": "wall_route02",
      "enemyType": "green",
      "description": "森林/落とし穴",
      "image": "images/wall2f_02.png"
    },
    {
      "id": "tower_west_1f",
      "name": "塔・西1F",
      "floor": 1,
      "area": "tower_west",
      "enemyType": "yellow",
      "description": "祭祀",
      "image": "images/tower_west_1f.png"
    },
    {
      "id": "tower_west_2f",
      "name": "塔・西2F",
      "floor": 2,
      "area": "tower_west",
      "enemyType": "yellow",
      "description": "祭祀",
      "image": "images/tower_west_2f.png"
    },
    {
      "id": "tower_west_3f",
      "name": "塔・西3F",
      "floor": 3,
      "area": "tower_west",
      "enemyType": "yellow",
      "description": "祭祀",
      "image": "images/tower_west_3f.png"
    },
    {
      "id": "tower_west_roof",
      "name": "塔・西屋上",
      "floor": 4,
      "area": "tower_west",
      "enemyType": "green",
      "description": "森林/天文台解除",
      "image": "images/tower_west_roof.png"
    },
    {
      "id": "wall_route05",
      "name": "城壁通路05",
      "floor": 3,
      "area": "wall_route05",
      "enemyType": "green",
      "description": "森林/魔獣出現ポイント",
      "image": "images/wall_route05.png"
    },
    {
      "id": "tower_northwest_1f",
      "name": "塔・北西1F",
      "floor": 1,
      "area": "tower_northwest",
      "enemyType": "green",
      "description": "",
      "image": "images/tower_northwest_1f.png"
    },
    {
      "id": "tower_northwest_2f",
      "name": "塔・北西2F",
      "floor": 2,
      "area": "tower_northwest",
      "enemyType": "green",
      "description": "",
      "image": "images/tower_northwest_2f.png"
    },
    {
      "id": "tower_northwest_3f",
      "name": "塔・北西3F",
      "floor": 3,
      "area": "tower_northwest",
      "enemyType": "green",
      "description": "草原/ボス(ジオイア戦、コイン)",
      "image": "images/tower_northwest_3f.png",
      "boss": true,
      "bossImage": "images/AB_GIOIA.png"
    },
    {
      "id": "tower_northwest_roof",
      "name": "塔・北西屋上",
      "floor": 4,
      "area": "tower_northwest",
      "enemyType": "green",
      "description": "草原",
      "image": "images/tower_northwest_roof.png"
    },
    {
      "id": "wall_route07",
      "name": "城壁通路07",
      "floor": 3,
      "area": "wall_route07",
      "enemyType": "yellow",
      "description": "祭祀/魔獣出現ポイント",
      "image": "images/wall_route07.png"
    },
    {
      "id": "tower_north1_1f",
      "name": "塔・北①1F",
      "floor": 1,
      "area": "tower_north1",
      "enemyType": "green",
      "description": "草原",
      "image": "images/tower_north1_1f.png"
    },
    {
      "id": "tower_north1_2f",
      "name": "塔・北①2F",
      "floor": 2,
      "area": "tower_north1",
      "enemyType": "green",
      "description": "草原",
      "image": "images/tower_north1_2f.png"
    },
    {
      "id": "tower_north1_3f",
      "name": "塔・北①3F",
      "floor": 3,
      "area": "tower_north1",
      "enemyType": "yellow",
      "description": "祭祀/ボス(カデス戦、カップ)",
      "image": "images/tower_north1_3f.png",
      "boss": true,
      "bossImage": "images/AB_KADES.png"
    },
    {
      "id": "tower_north1_4f",
      "name": "塔・北①4F",
      "floor": 4,
      "area": "tower_north1",
      "enemyType": "green",
      "description": "森林",
      "image": "images/tower_north1_4f.png"
    },
    {
      "id": "tower_north1_observatory",
      "name": "塔・北①天文台",
      "floor": 5,
      "area": "tower_north1",
      "enemyType": "green",
      "description": "森林/水門開放",
      "image": "images/tower_north1_observatory.png"
    },
    {
      "id": "wall2f_04",
      "name": "城壁2F04",
      "floor": 2,
      "area": "wall_route07",
      "enemyType": "green",
      "description": "森林",
      "image": "images/wall2f_04.png"
    },
    {
      "id": "wall2f_03",
      "name": "城壁2F03",
      "floor": 2,
      "area": "wall_route05",
      "enemyType": "green",
      "description": "",
      "image": "images/wall2f_03.png"
    },
    {
      "id": "wall_route03",
      "name": "城壁通路03",
      "floor": 3,
      "area": "wall_route02",
      "enemyType": "green",
      "description": "",
      "image": "images/wall_route03.png"
    },
    {
      "id": "courtyard_west",
      "name": "中庭(西)",
      "floor": 1,
      "area": "courtyard",
      "enemyType": "yellow",
      "description": "",
      "image": "images/courtyard_west.png"
    },
    {
      "id": "south_well_bottom",
      "name": "南井戸の底",
      "floor": 0,
      "area": "courtyard",
      "enemyType": "yellow",
      "description": "",
      "image": "images/south_well_bottom.png"
    }
  ],
  "warps": [
    {
      "from": "tower_south1_1f",
      "to": "tower_south1_2f",
      "direction": "up",
      "locked": false
    },
    {
      "from": "tower_south1_2f",
      "to": "tower_south1_3f",
      "direction": "up",
      "locked": false
    },
    {
      "from": "tower_south1_3f",
      "to": "tower_south1_roof",
      "direction": "up",
      "locked": false
    },
    {
      "from": "tower_south1_roof",
      "to": "gate1_roof",
      "direction": "east",
      "locked": false
    },
    {
      "from": "gate1_roof",
      "to": "gate1_3f",
      "direction": "down",
      "locked": false
    },
    {
      "from": "tower_south1_2f",
      "to": "wall2f_01",
      "direction": "west",
      "locked": true,
      "condition": "城門①3Fクリア後"
    },
    {
      "from": "wall2f_01",
      "to": "tower_southwest_2f",
      "direction": "west",
      "locked": false
    },
    {
      "from": "tower_southwest_2f",
      "to": "tower_southwest_3f",
      "direction": "up",
      "locked": false
    },
    {
      "from": "tower_southwest_3f",
      "to": "tower_southwest_roof",
      "direction": "up",
      "locked": false
    },
    {
      "from": "tower_southwest_2f",
      "to": "tower_southwest_1f",
      "direction": "down",
      "locked": false
    },
    {
      "from": "tower_southwest_2f",
      "to": "wall2f_02",
      "direction": "west",
      "locked": false
    },
    {
      "from": "wall2f_02",
      "to": "tower_west_2f",
      "direction": "west",
      "locked": false
    },
    {
      "from": "tower_west_2f",
      "to": "tower_west_1f",
      "direction": "down",
      "locked": false
    },
    {
      "from": "tower_west_2f",
      "to": "tower_west_3f",
      "direction": "up",
      "locked": false
    },
    {
      "from": "tower_west_3f",
      "to": "tower_west_roof",
      "direction": "up",
      "locked": false
    },
    {
      "from": "tower_west_3f",
      "to": "wall_route05",
      "direction": "north",
      "locked": true,
      "condition": "天文台解除"
    },
    {
      "from": "wall_route05",
      "to": "tower_northwest_3f",
      "direction": "north",
      "locked": false
    },
    {
      "from": "tower_northwest_3f",
      "to": "tower_northwest_roof",
      "direction": "up",
      "locked": false
    },
    {
      "from": "tower_northwest_3f",
      "to": "wall_route07",
      "direction": "east",
      "locked": false
    },
    {
      "from": "wall_route07",
      "to": "tower_north1_3f",
      "direction": "east",
      "locked": false
    },
    {
      "from": "tower_north1_3f",
      "to": "tower_north1_4f",
      "direction": "up",
      "locked": false
    },
    {
      "from": "tower_north1_4f",
      "to": "tower_north1_observatory",
      "direction": "up",
      "locked": false
    },
    {
      "from": "tower_north1_3f",
      "to": "tower_north1_2f",
      "direction": "down",
      "locked": false
    },
    {
      "from": "tower_north1_2f",
      "to": "tower_north1_1f",
      "direction": "down",
      "locked": false
    },
    {
      "from": "tower_north1_2f",
      "to": "wall2f_04",
      "direction": "south",
      "locked": false
    },
    {
      "from": "gate1_1f",
      "to": "tower_south1_1f",
      "direction": "south",
      "locked": false
    },
    {
      "from": "tower_south1_3f",
      "to": "wall_route01",
      "direction": "west",
      "locked": true,
      "condition": "グローザ像クイズ完了後"
    },
    {
      "from": "wall_route01",
      "to": "tower_southwest_3f",
      "direction": "south",
      "locked": false
    },
    {
      "from": "tower_southwest_3f",
      "to": "wall_route03",
      "direction": "south",
      "locked": true,
      "condition": "グローザ像投票完了"
    },
    {
      "from": "wall_route03",
      "to": "tower_west_3f",
      "direction": "west",
      "locked": false
    },
    {
      "from": "tower_west_2f",
      "to": "wall2f_03",
      "direction": "east",
      "locked": false
    },
    {
      "from": "wall2f_03",
      "to": "tower_northwest_2f",
      "direction": "north",
      "locked": false
    },
    {
      "from": "tower_northwest_2f",
      "to": "tower_northwest_3f",
      "direction": "up",
      "locked": false
    },
    {
      "from": "tower_west_1f",
      "to": "courtyard_west",
      "direction": "down",
      "locked": true,
      "condition": "水門開放"
    },
    {
      "from": "courtyard_west",
      "to": "south_well_bottom",
      "direction": "south",
      "locked": false
    }
  ],
  "metadata": {
    "enemyTypes": {
      "yellow": "祭祀系",
      "green": "森林/草原系"
    },
    "areas": {
      "tower_south1": "塔・南①",
      "tower_southwest": "塔・南西",
      "tower_west": "塔・西",
      "tower_northwest": "塔・北西",
      "tower_north1": "塔・北①",
      "gate1": "城門①",
      "wall2f": "城壁2F",
      "wall_route": "城壁通路",
      "courtyard": "中庭",
      "well": "井戸"
    }
  }
};
