import { ObjectId } from 'mongodb';

export interface Image {
  _id?: ObjectId;
  url: string;
  createdAt: Date;
}
