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

    mock = await Mock.remove({_id: req.params.id});

  } catch ({message}) {

    return next({
      status: 400,
      message
    });

  }

  res.json(mock);

};

export const index = async (req, res, next) => {

  res.render('index', {});

};