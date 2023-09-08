import { ImageUrls } from "../types/Image";

export interface LocalcosmosUser {
  id: number,
  /** @format uuid */
  uuid: string;
  /**
   * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
   * @pattern ^[\w.@+-]+$
   */
  username: string;
  firstName?: string;
  lastName?: string;
  /**
   * Email address
   * @format email
   */
  email: string;
  profilePicture: ImageUrls;
}

export interface Registration {
  /**
   * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
   * @pattern ^[\w.@+-]+$
   */
  username: string;
  password: string;
  password2: string;
  firstName?: string;
  lastName?: string;
  /** @format email */
  email: string;
  /** @format email */
  email2: string;
  clientId: string;
  platform: string;
}

export interface PasswordReset {
  /** @format email */
  email: string;
}

export interface TokenBlacklist {
  refresh: string;
}

export interface TokenObtainPairSerializerWithClientID {
  clientId: string;
  platform: string;
  username: string;
  password: string;
}

export interface TokenRefresh {
  access: string;
  refresh: string;
}
