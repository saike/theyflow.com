import Mock from '../../models/mock';

export const list = async (req, res, next) => {

  // const credentials = req.body;

  let list;

  try {

    list = await Mock.find({});

  } catch ({message}) {

    return next({
      status: 400,
      message
    });

  }

  res.json(list);

};

export const create = async (req, res, next) => {

  console.log('create mock:', req.body);

  let mock;

  try {

    mock = await Mock.create(req.body);

    await mock.download_mock();

  } catch ({message}) {

    return next({
      status: 400,
      message
    });

  }

  res.json(mock);

};

export const edit = async (req, res, next) => {

  console.log('edit mock:', req.params);
  console.log('edit mock:', req.body);

  let mock;

  try {

    mock = await Mock.findOneAndUpdate({ _id: req.params.id }, req.body, {upsert:true, new: true});

    console.log(mock.x, mock.y);

  } catch ({message}) {

    return next({
      status: 400,
      message
    });

  }

  res.json(mock);

};

export const remove = async (req, res, next) => {

  console.log('delete mock:', req.params);

  let mock;

  if(!req.params.id) {
    return next({
      status: 400,
      message: 'Provide id'
    });
  }

  try {

    mock = await Mock.findOne({_id: req.params.id});

    mock.delete_media();

    mock.remove();

  } catch ({message}) {

    return next({
      status: 400,
      message
    });

  }


  res.json({
    status: 200,
    mock: mock
  });

};