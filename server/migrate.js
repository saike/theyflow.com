import mongoose from 'mongoose';
import CONFIG from './config';
import Mock from './models/mock';
import fs from 'fs';
import request from 'request';
import path from 'path';
import jimp from 'jimp';

import { IMAGE_SCALES } from "./models/mock";

let mocks_dir = path.join(__dirname, '..', 'media', 'mocks');
let one_dir = path.join(__dirname, '..', 'media', 'mocks', '1x');

if (!fs.existsSync(mocks_dir)){
  fs.mkdirSync(mocks_dir);
}

if (!fs.existsSync(one_dir)){
  fs.mkdirSync(one_dir);
}


IMAGE_SCALES.forEach((scale) => {

  let dir = path.join(__dirname, '..', 'media', 'mocks', scale.dir);

  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }

});


mongoose.connect([ CONFIG.MONGODB.HOST, CONFIG.MONGODB.DATABASE_NAME ].join('/'), (err) => {

  if(err) throw err;

  console.log('mongo connected');

  Mock.find({}).then((mocks) => {

    console.log(mocks);

    download_mocks(mocks);

  }, (err) => {
    console.error(err);
  });

});

const download_mocks = (mocks) => {

  return new Promise((resolve, reject) => {

    let current = 0;

    let download = function () {

      console.log(`Migrated: ${current}/${mocks.length}`);

      download_mock(mocks[current]).then(() => {

        if(current < mocks.length) {

          current++;

          download();

        }
        else {

          console.log('DOWNLOADING COMPLETE');

        }

      }, (err) => {

        if(current < mocks.length) {

          current++;

          download();

        }
        else {

          console.log('DOWNLOADING COMPLETE');

        }

      });
    };

    download();

  });

};


const download_mock = (mock) => {

  return new Promise((resolve, reject) => {

    console.log(`Mock download start: ${mock.id}`);

    request.head(mock.url, function(err, res, body){
      // console.log('content-type:', res.headers['content-type']);
      // console.log('content-length:', res.headers['content-length']);

      // console.log(body);

      // let re = /(?:\.([^.]+))?$/;

      if(err) {

        reject(err);
        return;

      }

      let file_name = path.join(__dirname, '..', 'media', 'mocks', '1x', `${mock._id}.png`);

      if(fs.existsSync(file_name)) {

        make_thumbs(mock, file_name);

      }
      else {
        request(mock.url).pipe(fs.createWriteStream(file_name)).on('close', () => {
          console.warn(`Mock download finish: ${mock.id}`);

          make_thumbs(mock, file_name);

          resolve(mock);
        });
      }


    });

  });


};

const make_thumbs = (mock, file_name) => {

  jimp.read(file_name, (err, image) => {

    if (err) {

      console.error(`Cannot read image: ${file_name}`);
      return;

    }

    // console.log(image.bitmap.width);

    IMAGE_SCALES.forEach((scale) => {

      let resized_file_name = path.join(__dirname, '..', 'media', 'mocks', scale.dir, `${mock._id}.png`);

      // console.log(scale.scale);

      let clone = image.clone();

      clone.resize(image.bitmap.width * parseFloat(scale.scale), jimp.AUTO).write(resized_file_name);



    });

  });

};

