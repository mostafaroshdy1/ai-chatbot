import { UserModels } from 'src/models/user.models';

export interface LocalStorageModels {
  currentUser: UserModels.AccessToken;
}
