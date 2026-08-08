import { revalidateTag, unstable_cache } from "next/cache";
import { collectSparkData } from "./collector";

export const getSparkData = unstable_cache(
  async () => collectSparkData(),
  ["spark-current-dashboard"],
  { tags: ["spark-current-dashboard"], revalidate: 26 * 60 * 60 }
);

export async function refreshSparkData() {
  revalidateTag("spark-current-dashboard");
  return getSparkData();
}
