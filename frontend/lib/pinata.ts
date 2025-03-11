export async function uploadJsonToPinata(
  name: string,
  jsonObject: any
): Promise<{ uri: string; hash: string }> {

  const formData = new FormData();
  formData.append("jsonObject", jsonObject)
  formData.append("name", name)

  const response = await fetch("/api/pinata/json", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();
  return result;
}

export async function uploadImageToPinata(image: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", image)

  const response = await fetch("/api/pinata/image", {
    method: "POST",
    body: formData,
  });

  const { url } = await response.json();
  return url;
}
