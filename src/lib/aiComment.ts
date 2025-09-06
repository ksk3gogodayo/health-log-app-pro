export const fetchAiComment = async (input: string): Promise<string> => {
  const res = await fetch("/api/generate-comment", {
    method: "post",
    headers: { "Content-Type": `application/json` },
    body: JSON.stringify({ input }),
  });

  const data = await res.json();
  return data.comment || "(コメント生成失敗)";
};
