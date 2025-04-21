export const getSeason = () => {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
};

export const getMode = () => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const seasonThemes = {
  spring: {
    lightColor: "#333333", // ライトモード用：読みやすい濃グレー
    darkColor: "#ffffff",  // ← ここ変更！
    message: "🌸 春：新しい気持ちで、ゆっくりスタート",
    background: "url(/spring.jpg)",
  },
  summer: {
    lightColor: "#222222", // ライトモード用：さらに濃いめ
    darkColor: "#a0eaff",   // ダークモード用：涼しい水色
    message: "🌻 夏：水分補給して、自分をいたわろう",
    background: "url(/summer.jpg)",
  },
  autumn: {
    lightColor: "#2c1b00", // ライトモード用：深いブラウン
    darkColor: "#ffd699",   // ダークモード用：やわらか黄土色
    message: "🍁 秋：ゆったり、心整えるとき",
    background: "url(/autumn.jpg)",
  },
  winter: {
    lightColor: "#1c1c1c", // ライトモード用：落ち着いたグレー
    darkColor: "#dfefff",   // ダークモード用：淡い雪色ブルー
    message: "⛄ 冬：無理せず、ぬくぬく過ごそう",
    background: "url(/winter.jpg)",
  },
} as const;
