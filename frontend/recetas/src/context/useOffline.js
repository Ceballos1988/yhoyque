import { useContext } from "react";
import OfflineContext from "./OfflineContext"; // ✅ Importa el contexto

export const useOffline = () => useContext(OfflineContext); // ✅ Hook separado
