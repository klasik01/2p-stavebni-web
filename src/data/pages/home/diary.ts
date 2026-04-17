import { ROUTES } from "../../../config/routes";
import type { DiaryContent } from "../../../types/content";

export const diary: DiaryContent = {
  label: "Novinka ve stavebnictví",
  title: "Elektronický stavební deník",
  description:
    "Jako investor máte přístup ke svému projektu 24/7. Sledujte postup stavby v reálném čase přes naše webové rozhraní. Plná transparentnost, žádná překvapení.",
  action: { label: "Chci vědět více", href: ROUTES.contact },
};
