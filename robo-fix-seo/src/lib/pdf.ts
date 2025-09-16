export async function generateAndUploadPDF(html: string, fileName: string) {
  // TODO: integrate Playwright + Vercel Blob/S3
  const fake = `${process.env.ROBODOMAIN}/static/pdf/${encodeURIComponent(
    fileName
  )}`;
  return fake;
}
