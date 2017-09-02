export const admin = async (req, res, next) => {

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