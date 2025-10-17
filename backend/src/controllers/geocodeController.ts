// src/controllers/geocodeController.ts
import axios from "axios";
import { Request, Response } from "express";

export async function geocode(req: Request, res: Response) {
  try {
    const q = (req.query.query as string)?.trim();
    if (!q) return res.status(400).json({ error: "Parâmetro 'query' é obrigatório." });

    const url = "https://nominatim.openstreetmap.org/search";
    const { data } = await axios.get(url, {
      params: { q, format: "json", addressdetails: 1, limit: 1 },
      // OSM exige um User-Agent identificável
      headers: { "User-Agent": "GeoInsight/1.0 (contato@octacode.example)" },
      timeout: 10000,
    });

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(404).json({ error: "Local não encontrado." });
    }

    const item = data[0];
    return res.json({
      lat: Number(item.lat),
      lon: Number(item.lon),
      display_name: item.display_name,
    });
  } catch (err: any) {
    const status = err?.response?.status ?? 500;
    return res.status(status).json({ error: "Falha ao geocodificar.", detail: err?.message });
  }
}
