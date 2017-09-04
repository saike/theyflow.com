(function () {

  let gallery = angular.module('gallery', [ 'ui.router' ]);

  gallery.config(function ($stateProvider) {

    $stateProvider.state({
      name: 'gallery',
      url: '',
      component: 'gallery'
    });

    $stateProvider.state({
      name: 'admin',
      url: '/admin',
      component: 'gallery',
      params: {
        authorized: true
      }
    });

    $stateProvider.state({
      name: 'login',
      url: '/login',
      component: 'login'
    });

  });

  gallery.component('gallery', {
    template: `
      <div>
        <div class="nav_bar" data-ng-if="$ctrl.auth.authorized">
          <button type="button" class="nav_bar_btn create" data-ng-click="$ctrl.wizard.open()">Create</button>
        </div>
        <div class="create_modal" data-ng-show="$ctrl.wizard.show">
          <form class="create_form" novalidate data-ng-submit="$ctrl.wizard.create()">
            <div>
              <input type="text" id="url" placeholder="Enter url..." data-ng-model="$ctrl.wizard.current.url">
            </div>
            <div class="create_form_btns">
              <button type="submit" class="create_form_btn_create">Create</button>
              <button type="button" data-ng-click="$ctrl.wizard.cancel()">Cancel</button>
            </div>
          </form>
        </div>
        <div class="mock_canvas">
          <mock data-ng-repeat="mock in $ctrl.mocks" data-mock="mock" data-on-delete="$ctrl.remove_mock"></mock>
          <div data-ng-if="$ctrl.mocks.length < 1">
            <h3>No mocks found...</h3>
          </div>
        </div>  
      </div>
    `,
    controller: function (Mock, AuthAPI) {

      this.mocks = [];

      this.auth = AuthAPI;

      this.$onInit = () => {

        Mock.list().then((mocks) => {

          this.mocks = mocks;
          console.dir(mocks);

        });

      };

      this.remove_mock = (mock) => {
        this.mocks.splice(this.mocks.indexOf(mock), 1);
      };

      this.wizard = {
        show: false,
        current: false,
        open: () => {
          this.wizard.show = true;
          this.wizard.current = new Mock();
        },
        create: () => {
          this.wizard.current.save().then((res) => {
            this.mocks.push(this.wizard.current);
            this.wizard.cancel();
          });
        },
        cancel: () => {
          this.wizard.show = false;
          this.wizard.current = false;
        }
      };

    }
  });

  gallery.component('mock', {

    bindings: { mock: '<', on_delete: '<onDelete' },
    template: `
    
      <div>
        <img data-ng-show="$ctrl.mock.url" style="width: 100%;" data-ng-src="{{ $ctrl.mock.url }}" alt="">
        <span data-ng-show="!$ctrl.mock.url">NO IMAGE URL <button type="button" data-ng-click="$ctrl.remove_mock()">DELETE</button> </span>
      </div>
    
    `,
    controller(){

      this.remove_mock = () => {
        this.mock && this.mock.remove().then((res) => {

          if(res.status === 200) {
            this.on_delete && this.on_delete(this.mock);
          }
          else {
            console.log(res.message);
          }

        });
      };

    }
  });

  gallery.service('AuthAPI', function ($http) {

    this.authorized = false;

    this.check = () => {
      return $http.get('/auth/check').then((res) => {
        return res.data;
      });
    };

    this.login = (password) => {
      return $http.post('/auth/login', { password: password }).then((res) => {
        return res.data;
      });
    };

    this.logout = () => {
      return $http.post('/auth/logout').then((res) => {
        return res.data;
      });
    };

  });

  gallery.run((AuthAPI, $state, $transitions) => {

    $transitions.onStart({}, (trans) => {
      return AuthAPI.check().then((data) => {
        AuthAPI.authorized = (data.status === 200);
        console.dir(trans.params());
        if(trans.params().authorized && !AuthAPI.authorized) {
          console.log('NOT AUTHORIZED!');
          trans.router.stateService.transitionTo('login');
          return true;
        }
      });
    });

    $transitions.onFinish({}, (trans) => {
      console.dir(trans);
    })

  });

  gallery.component('login', {

    template:
      `
        <div class="form_container">
          <form novalidate data-ng-submit="$ctrl.login()" data-ng-show="!$ctrl.AuthAPI.authorized">
            <div>
              <input type="text" placeholder="Enter password..." data-ng-model="$ctrl.password">
            </div>
            <div>
              <button type="submit">Login</button>
            </div>
          </form>
          <form novalidate data-ng-submit="$ctrl.logout()" data-ng-show="$ctrl.AuthAPI.authorized">
            <div>
              <button type="submit">Logout</button>
            </div>
          </form>  
        </div>
      `,
    controller: function (AuthAPI, $state) {

      this.password = '';

      this.AuthAPI = AuthAPI;

      this.login = () => {
        AuthAPI.login(this.password).then((data) => {

          console.dir(data);
          if(data.status === 200) {

            this.AuthAPI.authorized = true;

            $state.transitionTo('admin');

          }

        });
      };

      this.logout = () => {
        AuthAPI.logout().then((data) => {

          console.dir(data);
          if(data.status === 200) {

            this.AuthAPI.authorized = false;
            // $state.go('root');
            $state.reload();


          }

        });
      };

    }

  });

  gallery.service('Mock', function ($http) {
    return class Mock{

      constructor(data){
        Object.assign(this, data);
      }
      save(){
        if(!this._id){
          return $http.post('/mocks', this).then((res) => {
            return Object.assign(this, res.data);
          });
        }
      }
      remove(){
        return $http.delete(`/mocks/${this._id}`).then((res) => {
          return res.data;
        });
      }
      static list() {
        return $http.get('/mocks').then((res) => {
          return res.data.map(mock => new Mock(mock));
        });
      }

    }
  });

  gallery.component('mockWizard', {

    template: `
    
      <div style="text-align: center;">
        <form style="display: inline-block; margin-top: 100px; text-align: left;" novalidate data-ng-submit="$ctrl.create_mock()">
          <span style="margin: 30px 0; color: green;" data-ng-show="$ctrl.success">MOCK CREATED SUCCESSFUL!</span> <br>
          <label style="margin-top: 10px; font-size: 20px; padding: 10px;" for="">URL</label> <br>
          <input style="margin-top: 10px; font-size: 20px; padding: 10px; width: 500px;" type="text" data-ng-model="$ctrl.mock.url"> <br>
          <label style="margin-top: 10px; font-size: 20px; padding: 10px;" for="">X</label> <br>
          <input style="margin-top: 10px; font-size: 20px; padding: 10px; width: 500px;" type="text" data-ng-model="$ctrl.mock.x"> <br>
          <label style="margin-top: 10px; font-size: 20px; padding: 10px;" for="">Y</label> <br>
          <input style="margin-top: 10px; font-size: 20px; padding: 10px; width: 500px;" type="text" data-ng-model="$ctrl.mock.y"> <br>
          <button style="margin-top: 30px; font-size: 20px; padding: 10px; width: 523px;" type="submit">CREATE!</button>
        </form>
      </div>
    
    `,
    controller(Mock){

      this.mock = new Mock();

      this.success = false;

      this.create_mock = () => {
        this.success = false;
        this.mock.save().then((mock) => {
          this.success = true;
          console.dir(mock);
          this.mock = new Mock();
        })
      };

    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    angular.bootstrap(document.body, [ 'gallery' ]);
  })

}());