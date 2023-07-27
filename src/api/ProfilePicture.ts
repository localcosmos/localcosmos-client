import { ImageUrls } from "../Image";

export interface CropParameters {
  x: number,
  y: number,
  width: number,
  height: number,
}

export type UploadProfilePictureRequest = {
  sourceImage: BinaryData,
  cropParameters?: CropParameters | null,
}

export interface ProfilePicture {
  id: number,
  imageUrl: ImageUrls
}