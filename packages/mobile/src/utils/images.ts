import { ImagePickerAsset } from "expo-image-picker";

export const convertToBase64 = async (
  asset: ImagePickerAsset
): Promise<string> => {
  const img = await fetch(asset.uri);
  const blob = await img.blob();

  const imageData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(blob);
  });

  const base64 = imageData.replace(/^data:image\/\w+;base64,/, "");

  return base64;
};
