import mongoose, { Schema } from 'mongoose';

const MockSchema = new Schema({
  x: Number,
  y: Number,
  title: String,
  url: String,
  type: String,
  width: Number,
  height: Number,
  layer: Number
});

export const IMAGE_SCALES = [
  {
    dir: '09x',
    scale: 0.9
  },
  {
    dir: '08x',
    scale: 0.8
  },
  {
    dir: '07x',
    scale: 0.7
  },
  {
    dir: '06x',
    scale: 0.6
  },
  {
    dir: '05x',
    scale: 0.5
  },
  {
    dir: '04x',
    scale: 0.4
  },
  {
    dir: '03x',
    scale: 0.3
  },
  {
    dir: '02x',
    scale: 0.2
  },
  {
    dir: '01x',
    scale: 0.1
  },
  {
    dir: '005x',
    scale: 0.05
  },
  {
    dir: '002x',
    scale: 0.02
  }
];

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