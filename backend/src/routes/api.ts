import { Router } from "express";
import { getStacItems, getTimeSeries } from "../controllers/bdcController";
import { geocode } from "../controllers/geocodeController";

const router = Router();

/**
 * STAC search (BDC)
 * Expects: latitude, longitude, (opcional) outros filtros
 */
router.get("/stac/search", getStacItems);

/**
 * WTSS time-series (BDC)
 * Expects: latitude, longitude, coverage, attributes, start_date, end_date
 */
router.get("/wtss/time-series", getTimeSeries);

/**
 * Geocode (proxy → Nominatim/OSM)
 * Expects: query (string livre: "Cidade, UF" | "Cidade, País" | endereço)
 */
router.get("/geocode", geocode);

export default router;
