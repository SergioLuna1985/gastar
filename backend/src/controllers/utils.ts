export const idParam = (value: string) => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : 0;
};
