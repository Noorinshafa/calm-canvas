export default async function handler(req, res) {
  res.status(200).json({
    tokenExists: !!process.env.PRINTIFY_API_TOKEN,
    tokenLength: process.env.PRINTIFY_API_TOKEN?.length || 0,
    tokenStart: process.env.PRINTIFY_API_TOKEN?.substring(0, 8) || "NONE",
  });
}