import mongoose, { Schema } from 'mongoose';

const MockSchema = new Schema({
  x: Number,
  y: Number,
  title: String,
  url: String,
  type: String,
  width: Number,
  height: Number
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
// MockSchema.methods.visible = function () {
//
//   let json = Object.assign({}, this);
//
//   json.x = parseInt(json.x);
//   json.y = parseInt(json.y);
//
//   return json;
//
// };

export default mongoose.model('Mock', MockSchema);