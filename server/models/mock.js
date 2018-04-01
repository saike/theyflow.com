import mongoose, { Schema } from 'mongoose';
import request from 'request';
import fs from 'fs';
import path from 'path';
import jimp from 'jimp';

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

MockSchema.methods.download_mock = function() {

  let mock = this;

  return new Promise((resolve, reject) => {

    console.log(`Mock download start: ${mock._id}`);

    request.head(mock.url, function(err, res, body){
      // console.log('content-type:', res.headers['content-type']);
      // console.log('content-length:', res.headers['content-length']);

      // console.log(body);

      // let re = /(?:\.([^.]+))?$/;

      if(err) {

        reject(err);
        return;

      }

      let file_name = path.join(process.cwd(), 'media', 'mocks', '1x', `${mock._id}.png`);

      if(fs.existsSync(file_name)) {

        mock.make_thumbs(file_name).then(() => {
          resolve(mock);
        });

      }
      else {
        request(mock.url).pipe(fs.createWriteStream(file_name)).on('close', () => {
          console.warn(`Mock download finish: ${mock._id}`);

          mock.make_thumbs(file_name).then(() => {
            console.log(`Thumbs generated: ${mock._id}`);

            resolve(mock);
          });

        });
      }


    });

  });


};

MockSchema.methods.make_thumbs = function(file_name) {

  let mock = this;

  return new Promise((resolve, reject) => {

    jimp.read(file_name, async (err, image) => {

      if (err) {

        console.error(`Cannot read image: ${file_name}`);
        reject(err);
        return false;

      }

      mock.width = image.bitmap.width;
      mock.height = image.bitmap.height;

      await mock.save();

      // console.log(image.bitmap.width);

      IMAGE_SCALES.forEach(async (scale) => {

        let resized_file_name = path.join(process.cwd(), 'media', 'mocks', scale.dir, `${mock._id}.png`);

        // console.log(scale.scale);

        let clone = image.clone();

        await clone.resize(image.bitmap.width * parseFloat(scale.scale), jimp.AUTO).write(resized_file_name);


      });

      resolve(mock);

    });

  });



};

MockSchema.methods.delete_media = function () {

  let mock = this;

  let file_name = path.join(process.cwd(), 'media', 'mocks', '1x', `${mock._id}.png`);

  if(fs.existsSync(file_name)){

    fs.unlinkSync(file_name);

  }

  IMAGE_SCALES.forEach((scale) => {

    let resized_file_name = path.join(process.cwd(), 'media', 'mocks', scale.dir, `${mock._id}.png`);

    // console.log(scale.scale);

    if(fs.existsSync(resized_file_name)){

      fs.unlinkSync(resized_file_name);

    }

  });


};

export default mongoose.model('Mock', MockSchema);