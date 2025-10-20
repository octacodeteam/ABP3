// --- 1. Selecionando o Banco de Dados ---
// Este comando cria o banco de dados se ele não existir.
use geoinsight_db;

// --- 2. Inserção de Documentos (Embedding) ---
// Usando insertOne para adicionar um usuário com seus locais favoritos incorporados.
db.users.insertOne({
  "name": "Georgia Mantchev",
  "email": "georgia.m@email.com",
  "favorite_locations": [
    {
      "display_name": "Jacareí, SP, Brasil",
      "latitude": -23.3054,
      "longitude": -45.9659,
      "added_at": new Date()
    }
  ]
});

// --- 3. Inserção de Documentos (Referencing) ---
// Primeiro, inserimos um local e guardamos seu ID.
const sjcLocation = db.locations.insertOne({
  "display_name": "São José dos Campos, SP, Brasil",
  "latitude": -23.1791,
  "longitude": -45.8872
});
const sjcId = sjcLocation.insertedId;

// Agora, usamos insertMany para adicionar vários STAC items referenciando o ID do local.
db.stac_items.insertMany([
  {
    "stac_id": "LC08_L1TP_219076_20251001",
    "collection": "LANDSAT-8-L1",
    "datetime": new Date("2025-10-01T13:30:00Z"),
    "cloud_cover": 5.2,
    "location_id": sjcId // Referência
  },
  {
    "stac_id": "S2A_MSIL2A_20251003",
    "collection": "S2-16D-2",
    "datetime": new Date("2025-10-03T13:50:00Z"),
    "cloud_cover": 25.8,
    "location_id": sjcId // Referência
  },
  {
    "stac_id": "S2B_MSIL2A_20251008",
    "collection": "S2-16D-2",
    "datetime": new Date("2025-10-08T13:50:00Z"),
    "cloud_cover": 10.1,
    "location_id": sjcId // Referência
  }
]);

// --- 4. Consultas de Validação ---
// Consulta básica para ver todos os usuários.
db.users.find();

// Consulta com projeção: mostrar apenas o nome do usuário e o nome de seus locais favoritos.
db.users.find({}, { "name": 1, "favorite_locations.display_name": 1, "_id": 0 });

// Consultando todos os STAC items para um local específico usando seu ID.
// (Substitua o ObjectId pelo ID real gerado na sua inserção)
db.stac_items.find({ "location_id": ObjectId("a8d6f3c3b384f9b464f32359") });

// --- 5. Consultas com Operadores Lógicos ---
// Encontrar itens da coleção 'S2-16D-2' que tenham poucas nuvens (cloud_cover < 20)
// E que sejam de uma data específica ou posterior.
db.stac_items.find({
  $and: [
    { "collection": "S2-16D-2" },
    { "cloud_cover": { $lt: 20 } },
    { "datetime": { $gte: new Date("2025-10-05T00:00:00Z") } }
  ]
});