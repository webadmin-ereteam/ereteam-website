function targetValue(name: string) {
  const raw = process.env[name];
  if (!raw) throw new Error(`${name} tanımlı değil`);
  const value = Number(raw.replaceAll(",", "").trim());
  if (!Number.isFinite(value) || value < 0) throw new Error(`${name} geçerli bir tutar değil`);
  return value;
}

export async function fetchAnnualTarget(year: number) {
  return targetValue(`SPARK_LICENSE_TARGET_${year}`) + targetValue(`SPARK_SERVICE_TARGET_${year}`);
}
