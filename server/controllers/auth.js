import CONFIG from '../config';

export const login = async (req, res, next) => {

  console.log('Authorizing:', req.body.password);

  if(req.body.password && req.body.password === CONFIG.PASSWORD) {

    req.session.authorized = true;
    res.json({
      status: 200,
      message: 'Authorized successful'
    });

  }
  else {
    req.session.authorized = false;
    res.json({
      status: 403,
      message: 'Bad password'
    });
  }

};

export const check = async (req, res, next) => {

  console.log('Check auth...');

  if(req.session.authorized) {

    res.json({
      status: 200,
      message: 'Authorized'
    });

  }
  else {
    res.json({
      status: 403,
      message: 'Unauthorized'
    });
  }

};

export const logout = (req, res) => {
  req.session.destroy(function(){
    console.log("user logged out.");
    res.json({
      status: 200,
      message: 'User logged out.'
    });
  }, (err) => {
    res.json({
      status: 400,
      message: 'Cant logout.'
    });
  });
};

export const AuthResolver = (req, res, next) => {
  if(req.session.authorized){
    next();     //If session exists, proceed to page
  } else {
    let err = new Error("Not logged in!");
    console.log(req.session.authorized);
    res.json({
      status: 403,
      message: 'Unauthorized'
    });
    // next(err);  //Error, trying to access unauthorized page!
  }
};