(function () {

  let gallery = angular.module('gallery', [ 'ui.router' ]);

  gallery.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider.state({
      name: 'gallery',
      url: '/',
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

    $urlRouterProvider.otherwise('/');

  });

  gallery.service('MockCanvas', function () {
    return class MockCanvas {

      constructor(){

        this.mocks = [];

        this.camera = {
          zoom: 1,
          x: 0,
          y: 0,
          width: 1440,
          height: 900,
          move: false
        };

      }
      reflow(elm) {

        let elm_width =  elm.offsetWidth || elm.innerWidth || 0;
        let elm_height = elm.offsetHeight || elm.innerHeight || 0;

        this.camera.width = elm_width/this.camera.zoom;
        this.camera.height = elm_height/this.camera.zoom;

        console.dir(this.camera);
        console.dir(elm);

      }
      viewport(){
        return {
          left: this.camera.x - (this.camera.width/2),
          top: this.camera.y - (this.camera.height/2),
          right: this.camera.x + (this.camera.width/2),
          bottom: this.camera.y + (this.camera.height/2)
        };
      }
      mock_position(mock){

        let viewport = this.viewport();

        return {
          top: (mock.y - viewport.top)*this.camera.zoom + 'px',
          left: (mock.x - viewport.left)*this.camera.zoom + 'px',
          width: (this.camera.zoom*1000) + 'px'
        }

      }
      render(){



      }

    }
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
          <mock-canvas data-mock-canvas="$ctrl.MockCanvas" data-edit="$ctrl.auth.authorized"></mock-canvas>
        </div>  
      </div>
    `,
    controller: function (Mock, AuthAPI, MockCanvas, $window) {

      this.mocks = [];

      this.auth = AuthAPI;

      this.MockCanvas = new MockCanvas();

      this.$onInit = () => {

        this.MockCanvas.camera.zoom = $window.innerWidth/6/1000;

        Mock.list().then((mocks) => {

          this.MockCanvas.mocks = mocks;
          console.dir(mocks);

        });

      };

      this.validate_url = function(url) {
        return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(url);
      };

      this.wizard = {
        show: false,
        current: false,
        open: () => {
          this.wizard.show = true;
          let mock = new Mock();
          mock.x = this.MockCanvas.camera.x - 500;
          mock.y = this.MockCanvas.camera.y;
          this.wizard.current = mock;
        },
        create: () => {
          if(!this.validate_url(this.wizard.current.url)) {

            let result = this.wizard.current.url.split('[img]')[1];
            result = result.split('[/img]')[0];
            if(result) {
              this.wizard.current.url = result;
            }
            else {
              return;
            }
            console.dir(this.wizard.current.url);
            // alert('BAD URL!');
          }
          this.wizard.current.save().then((res) => {
            this.MockCanvas.mocks.push(this.wizard.current);
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

  gallery.component('mockCanvas', {

    bindings: { MockCanvas: '<mockCanvas', edit: '<' },
    template:
      `
        <mock data-ng-repeat="mock in $ctrl.MockCanvas.mocks" data-edit="$ctrl.edit" data-mock="mock" data-on-delete="$ctrl.remove_mock" data-on-drag="$ctrl.drag_mock" data-ng-style="$ctrl.MockCanvas.mock_position(mock)"></mock>
        <div data-ng-if="$ctrl.MockCanvas.mocks.length < 1" class="empty_mocks_overlay">
          <h3>No mocks found...</h3>
        </div>
      `,
    controller($element, $window, $scope){

      this.$onChanges = () => {
        console.dir(this.MockCanvas);

        if(this.MockCanvas) {

          $window.addEventListener('resize', () => {
            this.MockCanvas.reflow($element[0]);
          });

          this.MockCanvas.reflow($element[0]);

        }
      };

      this.$onInit = () => {

        //camera movement events

        $element[0].addEventListener('contextmenu', (event) => {
          event.preventDefault();
          this.MockCanvas.camera.move = true;
          $scope.$digest();
          return false;
        }, false);

        $element[0].addEventListener('mousemove', (event) => {

          event.preventDefault();
          if(!this.MockCanvas.camera.move) return;
          let directionX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
          let directionY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
          // console.dir(directionX, directionY);
          this.MockCanvas.camera.x -= (directionX/this.MockCanvas.camera.zoom);
          this.MockCanvas.camera.y -= (directionY/this.MockCanvas.camera.zoom);
          $scope.$digest();

        });

        $element[0].addEventListener('mouseup', (event) => {
          event.preventDefault();
          this.MockCanvas.camera.move = false;
          $scope.$digest();
        });

        $element[0].addEventListener('mouseleave', (event) => {
          event.preventDefault();
          this.MockCanvas.camera.move = false;
          $scope.$digest();
        });

      };

      this.remove_mock = (mock) => {
        this.MockCanvas.mocks.splice(this.MockCanvas.mocks.indexOf(mock), 1);
      };

      this.drag_mock = (mock, type, event) => {
        if(type === 'move'){
          let directionX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
          let directionY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
          mock.x = parseInt(parseFloat(mock.x) + directionX/this.MockCanvas.camera.zoom).toString();
          mock.y = parseInt(parseFloat(mock.y) + directionY/this.MockCanvas.camera.zoom).toString();
        }
        if(type === 'end'){
          mock.save();
          console.log('save mock');
        }
        // console.log(type, mock);

      };

    }

  });

  gallery.component('mock', {

    bindings: { mock: '<', on_delete: '<onDelete', edit: '<', on_drag: '<onDrag' },
    template: `
    
      <div class="mock_container" data-ng-class="{ empty: !$ctrl.mock.url }">
        <img data-ng-show="$ctrl.mock.url" style="width: 100%;" data-ng-click="$ctrl.preview = true;" data-ng-src="{{ $ctrl.mock.url }}" alt="">
        <div class="mock_overlay" data-ng-if="$ctrl.edit">
          <div class="mock_edit_tools">
            <button class="delete_btn" type="button" data-ng-click="$ctrl.remove_mock()">Delete</button>                 
          </div>
          <div class="mock_coord top left">x: {{ $ctrl.mock.x }}, y: {{ $ctrl.mock.y }}</div>
        </div>
      </div>
      
      <div class="mock_preview" data-ng-if="$ctrl.preview" data-overlay-click="$ctrl.preview = false;">
        <img data-ng-src="{{ $ctrl.mock.url }}" alt="">
      </div>
    
    `,
    controller($element, $timeout, $scope){

      this.dragging = false;

      this.preview = false;

      //start drag

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

      this.$onInit = () => {

        $timeout(() => {

          let overlay = $element[0].querySelector('.mock_overlay');

          // console.dir(overlay);
          if(!overlay) return;

          overlay.addEventListener('mousedown', (e) => {
            e.preventDefault();

            if(!this.dragging && e.which === 1) {
              this.dragging = true;
              this.on_drag && this.on_drag(this.mock, 'start', e);
              $scope.$apply();
              console.dir(e);
            }

          }, false);

          overlay.addEventListener('mousemove', (e) => {
            e.preventDefault();

            if(this.dragging && e.which === 1) {
              $element[0].style.zIndex = 1000;
              this.on_drag && this.on_drag(this.mock, 'move', e);
              // console.dir(e);
              $scope.$apply();
            }

          }, false);

          overlay.addEventListener('mouseup', (e) => {
            e.preventDefault();
            if(this.dragging) {
              $element[0].style.zIndex = 0;
              this.dragging = false;
              this.on_drag && this.on_drag(this.mock, 'end', e);
              $scope.$apply();
            }
          }, false);

          overlay.addEventListener('mouseleave', (e) => {
            e.preventDefault();
            if(this.dragging) {
              $element[0].style.zIndex = 0;
              this.dragging = false;
              this.on_drag && this.on_drag(this.mock, 'end', e);
              $scope.$apply();
            }
          }, false);

        }, 10);



      }

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
        else {
          return $http.post(`/mocks/${this._id}`, this).then((res) => {
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

  gallery.directive('overlayClick', () => {
    return {
      restrict: 'A',
      link: function (scope, elm, attrs) {

        elm.bind('click', (e) => {
          if(e.target === elm[0]) {
            scope.$apply(() => {
              scope.$eval(attrs.overlayClick);
            })
          }
        })

      }
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    angular.bootstrap(document.body, [ 'gallery' ]);
  })

}());