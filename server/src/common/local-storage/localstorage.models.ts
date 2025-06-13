import { UserModels } from 'src/user/user.models';

export interface LocalStorageModels {
  currentUser: UserModels.AccessToken;
}
