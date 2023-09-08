import { ImageUrls } from "../types/Image";

export interface CropParameters {
  x: number,
  y: number,
  width: number,
  height: number,
}

export interface ProfilePicture {
  id: number,
  imageUrl: ImageUrls
}