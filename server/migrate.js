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

    download_mocks(mocks).then(() => {

      console.log('DOWNLOADING COMPLETE');
      // process.exit();

    }, (err) => {

      console.log('DOWNLOADING ERROR', err);
      // process.exit()

    });

  }, (err) => {
    console.error(err);
  });

});

const download_mocks = (mocks) => {

  return new Promise((resolve, reject) => {

    let current = 0;

    let download = function () {

      console.log(`Migrated: ${current}/${mocks.length}`);

      if(current >= mocks.length) {
        resolve('DOWNLOADING COMPLETE');
      }

      if(!mocks[current]) {
        reject({
          status: 'error',
          index: current,
          mock: mocks[current]
        });
      }

      mocks[current].download_mock().then(() => {

        if(current < mocks.length) {

          current++;

          download();

        }
        else {

          resolve('DOWNLOADING COMPLETE');

        }

      }, (err) => {

        if(current < mocks.length) {

          current++;

          download();

        }
        else {

          resolve('DOWNLOADING COMPLETE');

        }

      });
    };

    download();

  });

};

