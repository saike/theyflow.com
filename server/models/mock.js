import mongoose, { Schema } from 'mongoose';

const MockSchema = new Schema({
  x: String,
  y: String,
  title: String,
  url: String,
  type: String,
  width: String,
  height: String
});

// UserSchema.pre('save', async function (next) {
//
//   if(!this.isModified('password')){
//     return next();
//   }
//
//   const salt = await bcrypt.genSalt(10);
//   const hash = await bcrypt.hash(this.password, salt);
//
//   this.password = hash;
//
//   next();
//
// });

// UserSchema.methods.compare_passwords = function (password) {
//   return bcrypt.compare(password, this.password);
// };
//
// MockSchema.methods.visible = function (password) {
//   return {
//     name: this.facebook.name,
//     picture: this.facebook.picture,
//     email: this.facebook.email,
//     id: this._id
//   };
// };

export default mongoose.model('Mock', MockSchema);