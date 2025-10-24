import { Router } from "express";
// Importar as três funções do controller
import { getStacItems, getTimeSeries, getCoverageAttributes } from "../controllers/bdcController";
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
router.get("/wtss/time_series", getTimeSeries);

/**
 * Geocode (proxy → Nominatim/OSM)
 * Expects: query (string livre: "Cidade, UF" | "Cidade, País" | endereço)
 */
router.get("/geocode", geocode);

/**
 * NOVO: WTSS coverage attributes (BDC)
 * Expects: coverage (nome da coleção ou nomes separados por vírgula, ex: S2-16D-2,LANDSAT-16D-1)
 */
router.get("/wtss/attributes", getCoverageAttributes); // Nova rota adicionada

export default router;