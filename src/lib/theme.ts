export const getSeason = () => {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
};

export const seasonThemes = {
  spring: {
    color: "#ffccdd",
    message: "🌸 春：新しい気持ちで、ゆっくりスタート",
    background: "url(/spring.jpg)",
  },
  summer: {
    color: "#a0eaff",
    message: "🌻 夏：水分補給して、自分をいたわろう",
    background: "url(/summer.jpg)",
  },
  autumn: {
    color: "#ffd699",
    message: "🍁 秋：ゆったり、心整えるとき",
    background: "url(/autumn.jpg)",
  },
  winter: {
    color: "#dfefff",
    message: "⛄ 冬：無理せず、ぬくぬく過ごそう",
    background: "url(/winter.jpg)",
  },
} as const;
