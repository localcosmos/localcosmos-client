import { ProfilePicture } from "./ProfilePicture"

export type LocalcosmosPublicUser = {
  uuid: string,
  username: string,
  firstName?: string,
  lastName?: string,
  profilePicture?: ProfilePicture,
  dateJoined: string,
  datasetCount: number,
}