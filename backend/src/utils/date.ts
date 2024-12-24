export const oneYearFromNow = () => {
  return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
};

export const thirtyDaysFromNow = () => {
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
};

export const fifteenMinutesFromNow = () => {
  return new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
};

export const one_day_ms = () => {
  return 24 * 60 * 60 * 1000;
};
