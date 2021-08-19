import mongoose, { Schema, Document } from 'mongoose';

interface IAccount extends Document {
  _id: string;
  id: string;
  pw: string;
  role: 'Admin' | 'User';
}

const Account: Schema = new Schema({
  id: { type: String, index: true },
  pw: String,
  role: { type: String, enum: ['Admin', 'User'], default: 'User' },
});

export default mongoose.model<IAccount>('Account', Account);
