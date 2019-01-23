(function () {

  let gallery = angular.module('gallery', [ 'ui.router' ]);

  gallery.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {

    $stateProvider.state({
      name: 'gallery',
      url: '/?x&y&zoom',
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

    $locationProvider.html5Mode(true);

  });

  gallery.service('Konva', function ($window) {


    console.log($window);

    return $window.Konva;

  });

  gallery.component('gallery', {
    template: `
      <div>
        <div class="nav_bar" data-ng-if="$ctrl.auth.authorized">
          <button type="button" class="nav_bar_btn delete" data-ng-class="{ active: $ctrl.delete.enabled }" data-ng-click="$ctrl.delete.enabled = !$ctrl.delete.enabled;">Delete</button>
          <button type="button" class="nav_bar_btn create" data-ng-click="$ctrl.wizard.open()">Create</button>
          <button type="button" class="nav_bar_btn sizes" data-ng-click="$ctrl.calculate_size()">Calculate sizes</button>
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
          <mock-canvas data-mock-canvas="$ctrl.MockCanvas" data-delete="$ctrl.delete.enabled" data-edit="$ctrl.auth.authorized"></mock-canvas>
        </div>  
        <mock-preview data-mock="$ctrl.selector.preview" data-ng-if="$ctrl.selector.preview" data-overlay-click="$ctrl.selector.preview = false;"></mock-preview>
      </div>
    `,
    controller: function (Mock, AuthAPI, MockCanvas, $window, $stateParams) {

      // this.auth = AuthAPI;
      //
      // this.MockCanvas = new MockCanvas();
      //
      // this.$onInit = () => {
      //
      //   this.MockCanvas.camera.zoom = parseFloat($stateParams.zoom) || 0.02 || $window.innerWidth/6/1000;
      //
      //   this.MockCanvas.camera.x = parseFloat($stateParams.x) || 331.43;
      //   this.MockCanvas.camera.y = parseFloat($stateParams.y) || 10447.14;
      //
      //   Mock.list().then((mocks) => {
      //
      //     this.MockCanvas.mocks = mocks;
      //     console.dir(mocks);
      //
      //   });
      //
      // };
      //
      // this.validate_url = function(url) {
      //   return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(url);
      // };
      //
      // this.wizard = {
      //   show: false,
      //   current: false,
      //   open: () => {
      //     this.wizard.show = true;
      //     let mock = new Mock();
      //     mock.x = this.MockCanvas.camera.x - 500;
      //     mock.y = this.MockCanvas.camera.y;
      //     this.wizard.current = mock;
      //   },
      //   create: () => {
      //     if(!this.validate_url(this.wizard.current.url)) {
      //
      //       let result = this.wizard.current.url.split('[img]')[1];
      //       result = result.split('[/img]')[0];
      //       if(result) {
      //         this.wizard.current.url = result;
      //       }
      //       else {
      //         return;
      //       }
      //       console.dir(this.wizard.current.url);
      //       // alert('BAD URL!');
      //     }
      //     this.wizard.current.save().then((res) => {
      //       this.MockCanvas.mocks.push(this.wizard.current);
      //       this.wizard.cancel();
      //     });
      //   },
      //   cancel: () => {
      //     this.wizard.show = false;
      //     this.wizard.current = false;
      //   }
      // };
      //
      // this.calculate_size = () => {
      //
      //   for(let mock of this.MockCanvas.mocks) {
      //
      //     if(mock.width && mock.height) continue;
      //
      //     let mock_image = new Image();
      //
      //     mock_image.src = mock.url;
      //
      //     mock_image.onload = () => {
      //
      //       mock.width = mock_image.naturalWidth;
      //       mock.height = mock_image.naturalHeight;
      //       mock.save();
      //
      //     };
      //
      //   }
      //
      // };
      //
      // this.delete = {
      //   enabled: false
      // };

    }
  });

  gallery.service('MockCanvas', function (Konva, Mock, $filter, $rootScope) {
    return class MockCanvas {

      constructor(elm, width, height){

        this.mocks = [];

        this.screen = elm;

        this.stage = new Konva.Stage({
          container: this.screen,
          width: width,
          height: height,
          draggable: true
        });

        let mock_layer = new Konva.Layer({
          id: 'mock_layer'
        });

        this.stage.add(mock_layer);


        this.camera = {
          zoom: 0.05,
          x: 0,
          y: 0,
          width: 1440,
          height: 900,
          move: false
        };

        this.stage.scale({ x: this.camera.zoom, y: this.camera.zoom });

        console.log(this.stage);

        this.bind_events();

      }
      visible_mocks(){

        let viewport = this.viewport();

        let visible = this.mocks.filter((mock) => {

          let outside = mock.x + 1000 < viewport.left || mock.x > viewport.right || mock.y > viewport.bottom || mock.y < viewport.top - (mock.height * 1000/mock.width);

          return !outside;

        });

        // console.dir(visible);

        return visible;

      }
      bounding_box(){

        return {
          left: Math.min(...this.mocks.map(mock => mock.x)) < 0 ? Math.min(...this.mocks.map(mock => mock.x)) : 0,
          top: Math.min(...this.mocks.map(mock => mock.y)) < 0 ? Math.min(...this.mocks.map(mock => mock.y)) : 0,
          right: Math.max(...this.mocks.map(mock => mock.x)),
          bottom: Math.max(...this.mocks.map(mock => mock.y)),
          x: (Math.abs(Math.min(...this.mocks.map(mock => mock.x))) + Math.max(...this.mocks.map(mock => mock.x)))/2,
          y: (Math.abs(Math.min(...this.mocks.map(mock => mock.y))) + Math.max(...this.mocks.map(mock => mock.y)))/2
        }

      }
      reflow(elm) {

        // elm = elm || this.element;

        // let elm_width =  elm.offsetWidth || elm.innerWidth || 0;
        // let elm_height = elm.offsetHeight || elm.innerHeight || 0;

        this.camera.width = this.stage.width/this.camera.zoom;
        this.camera.height = this.stage.height/this.camera.zoom;

        // console.log(this.camera.x, this.camera.y, this.camera.width, this.camera.height, this.camera.zoom);
        // console.dir(elm);

      }
      viewport(){

        let bounding_box = this.bounding_box();

        return {
          left: this.camera.x/this.camera.zoom+Math.abs(bounding_box.left),
          top: this.camera.y/this.camera.zoom+Math.abs(bounding_box.top),
          right: (this.camera.x + this.stage.attrs.width)/this.camera.zoom+Math.abs(bounding_box.left),
          bottom: (this.camera.y + this.stage.attrs.height)/this.camera.zoom+Math.abs(bounding_box.top)
        };

      }
      mock_position(mock){

        let viewport = this.viewport();

        return {
          top: (mock.y - viewport.top)*this.camera.zoom + 'px',
          left: (mock.x - viewport.left)*this.camera.zoom + 'px',
          width: (this.camera.zoom*1000) + 'px',
          height: (this.camera.zoom*(mock.height * 1000/mock.width)) + 'px',
          zIndex: mock.layer
        }

      }
      render(){

        this.stage.draw();

      }
      load_mocks(){

        return Mock.list().then((mocks) => {

          this.mocks = mocks;

          console.dir(mocks);

          let bounding_box = this.bounding_box();

          let mock_layer = this.stage.findOne('#mock_layer');

          this.stage.x(0);
          this.stage.y(0);

          let initial_zoom = Math.min(this.stage.width()/(Math.abs(bounding_box.right) + Math.abs(bounding_box.left)), this.stage.height()/(Math.abs(bounding_box.top) + Math.abs(bounding_box.bottom)));

          this.stage.scale({
            x: initial_zoom,
            y: initial_zoom
          });

          this.camera.x = 0;
          this.camera.y = 0;
          this.camera.zoom = initial_zoom;
          // this.stage.width(bounding_box.right);
          // this.stage.height(bounding_box.bottom);
          console.log(this.stage);

          mocks.forEach((mock) => {

            mock.render(bounding_box, this.camera.zoom).then((mock) => {

              // console.log(mock.image.image());

              mock_layer.add(mock.image);

              this.render();

            });

            // console.log(img.src);

            // add the shape to the layer

          });


          console.log(bounding_box);

          return mocks;

        });

      }
      bind_events(){

        this.stage.on('wheel', (conva_event) => {

          let event = conva_event.evt;

          // console.log(this.stage.getPointerPosition());

          event.preventDefault();

          let wheel = event.wheelDelta/120;

          // Compute zoom factor.
          let zoom = Math.exp(wheel*0.2);

          let old_zoom = this.stage.scaleX();

          let new_zoom = old_zoom * zoom;

          if(new_zoom < 0.02) {

            new_zoom = 0.02;

          }
          if(new_zoom > 2) {

            new_zoom = 2;

          }

          let mouse_point_to = {
            x: this.stage.getPointerPosition().x / old_zoom - this.stage.x() / old_zoom,
            y: this.stage.getPointerPosition().y / old_zoom - this.stage.y() / old_zoom,
          };

          this.stage.scale({ x: new_zoom, y: new_zoom });

          let new_position = {
            x: -(mouse_point_to.x - this.stage.getPointerPosition().x / new_zoom) * new_zoom,
            y: -(mouse_point_to.y - this.stage.getPointerPosition().y / new_zoom) * new_zoom
          };

          this.stage.position(new_position);
          this.stage.batchDraw();

          this.camera.x = new_position.x;
          this.camera.y = new_position.y;

          this.camera.zoom = new_zoom;

          // let visible_mocks = this.visible_mocks();
          //
          // console.log(this.viewport());
          // console.log(visible_mocks);
          //
          // visible_mocks.forEach((mock) => {
          //
          //   mock.render(this.bounding_box(), this.camera.zoom).then(() => {
          //
          //     this.render();
          //
          //   });
          //
          // });

          // console.log(this.camera.zoom);
          $rootScope.$digest();

          // this.render();
          // console.log(event);
          // console.log(this.MockCanvas.camera);
        });

        this.stage.on('dragmove', (e) => {

          this.camera.x = this.stage.x();
          this.camera.y = this.stage.y();

          $rootScope.$digest();

        });

      }

    }
  });

  gallery.component('mockCanvas', {

    bindings: { edit: '<', delete: '<' },
    template:
      `  
        <div class="canvas_logger" data-ng-if="$ctrl.logger.show">
          Camera:
          <br>
          x: {{ $ctrl.MockCanvas.camera.x | number:2 }},
          y: {{ $ctrl.MockCanvas.camera.y | number:2 }},
          zoom: {{ $ctrl.MockCanvas.camera.zoom | number:2 }}
        </div>
        <div class="mock_canvas_background">
          <div class="mock_canvas_viewport"></div>
        </div>
      `,
    controller($element, $window, $scope, $interval, $timeout, MockCanvas, Mock){

      this.$onChanges = (changes) => {

        // console.dir(changes);

        if(this.canvas) {

          this.MockCanvas = new MockCanvas(this.canvas, this.canvas.offsetWidth, this.canvas.offsetHeight);

          this.MockCanvas.load_mocks();

          // this.MockCanvas.reflow();

          // console.log('reflow', this.MockCanvas.camera.zoom);

        }
      };

      this.$onInit = () => {

        //camera movement events
        this.canvas = $element[0].querySelector('.mock_canvas_viewport');

        // console.log(this.canvas);

        this.MockCanvas = new MockCanvas(this.canvas, this.canvas.offsetWidth, this.canvas.offsetHeight);

        this.MockCanvas.load_mocks();

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
          console.dir(directionX, directionY);
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



        let camera_move = [ false, false, false, false ];

        let move_interval = false;

        $window.addEventListener('keydown', (event) => {

          let move_delta = 20/this.MockCanvas.camera.zoom;

          if(!move_interval) {
            move_interval = $interval(() => {

              if(camera_move[0]) {
                this.MockCanvas.camera.x-=move_delta;
              }
              if(camera_move[1]) {
                this.MockCanvas.camera.y-=move_delta;
              }
              if(camera_move[2]) {
                this.MockCanvas.camera.x+=move_delta;
              }
              if(camera_move[3]) {
                this.MockCanvas.camera.y+=move_delta;
              }

            }, 1000/60);
          }

          switch(event.keyCode) {

            case 37:
              camera_move[0] = true;
              break;
            case 38:
              camera_move[1] = true;
              break;
            case 39:
              camera_move[2] = true;
              break;
            case 40:
              camera_move[3] = true;
              break;

          }

          // $scope.$digest();

        });

        $window.addEventListener('keyup', (event) => {
          switch(event.keyCode) {

            case 37:
              camera_move[0] = false;
              break;
            case 38:
              camera_move[1] = false;
              break;
            case 39:
              camera_move[2] = false;
              break;
            case 40:
              camera_move[3] = false;
              break;
            case 76:
              this.logger.show = !this.logger.show;
              $scope.$apply();
              break;

          }
          if(move_interval && !camera_move.some(move => move)) {
            $interval.cancel(move_interval);
            move_interval = false;
          }
        });

        $window.addEventListener('resize', () => {
          this.MockCanvas && this.MockCanvas.reflow();
          $scope.$digest();
        });

      };

      this.remove_mock = (mock) => {
        this.MockCanvas.mocks.splice(this.MockCanvas.mocks.indexOf(mock), 1);
      };

      this.selector = {
        selected: [],
        selecting: false,
        preview: false,
        deselect_all: () => {
          this.selector.selected = [];
        },
        select: (mock, $event) => {

          if($event.which !== 1) return;

          if(this.edit) {

            if(this.selector.selected.indexOf(mock) < 0){
              this.selector.selected.push(mock);
              this.selector.selecting = true;
            }

          }
          else {
            this.selector.preview = mock;
          }

        },
        deselect: (mock, $event) => {

          if($event.which !== 1) return;

          if(this.selector.selecting) {
            this.selector.selecting = false;
            return;
          }

          if(this.dragging) return;

          if(this.edit) {

            if(this.selector.selected.indexOf(mock) >= 0){

              this.selector.selected.splice(this.selector.selected.indexOf(mock), 1);

            }

          }
          else {
            this.selector.preview = false
          }


        }
      };

      this.dragging = false;

      this.drag_mock = (mock_target, type, event) => {

        this.selector.selected.forEach((mock) => {
          if(type === 'move'){
            this.dragging = true;
            let directionX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            let directionY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
            let move_delta_x = (directionX/this.MockCanvas.camera.zoom);
            let move_delta_y = (directionY/this.MockCanvas.camera.zoom);
            mock.x = parseInt(parseFloat(mock.x) + move_delta_x);
            mock.y = parseInt(parseFloat(mock.y) + move_delta_y);
            // console.log(mock.x, mock.y, this.MockCanvas.camera.zoom, move_delta_x, move_delta_y);
          }
          if(type === 'end'){
            $timeout(() => {
              this.dragging = false;
            }, 10);
            mock.save();
            console.log('save mock');
          }
        });


        // console.log(type, mock);

      };

      this.logger = {
        show: false
      };

    }

  });

  gallery.component('mockPreview', {

    bindings: { mock: '<', on_close: '&onClose' },
    template: `
      <img data-ng-src="{{ $ctrl.mock.url }}" alt="">
    `,
    controller(){

    }

  });

  gallery.directive('ngOnload', function () {

    return {
      restrict: 'A',
      link: function (scope, element, attrs) {

        element.bind('load', function () {
          scope.$eval(attrs.ngOnload);
          scope.$apply();
        });

      }
    };

  });

  gallery.component('mock', {

    bindings: { mock: '<', delete: '<', on_delete: '<onDelete', edit: '<', on_drag: '<onDrag', zoom: '<?' },
    template: `
    
      <div class="mock_container" data-ng-class="{ empty: !$ctrl.mock.url }">
        <img data-ng-show="$ctrl.mock.url" style="width: 100%;" data-ng-src="{{ $ctrl.mock | mock_image_url:$ctrl.zoom }}" data-ng-onload="$ctrl.loaded = true;" alt="" data-ng-class="{ visible: $ctrl.loaded }">
        <div class="mock_coord top left" data-ng-if="$ctrl.edit">
          x: {{ $ctrl.mock.x }}, y: {{ $ctrl.mock.y }} <br>
          w: {{ $ctrl.mock.width || 0 }}, h: {{ $ctrl.mock.height || 0 }}
        </div>
        
        <div class="mock_layer_tools" data-ng-if="$ctrl.edit" data-ng-mousedown="$event.stopPropagation();" data-ng-mouseup="$event.stopPropagation()">
          <button type="button" data-ng-click="$ctrl.change_layer(true);">&nbsp;+&nbsp;</button> 
          <span>{{ $ctrl.mock.layer || 0 }}</span>
          <button type="button"  data-ng-click="$ctrl.change_layer(false);">&nbsp;-&nbsp;</button> 
        </div>
       
      </div>
      
      <div class="mock_overlay" data-ng-if="$ctrl.edit && !$ctrl.delete"></div>
      <div class="mock_overlay_delete" data-ng-if="$ctrl.delete" data-ng-click="$ctrl.remove_mock();"></div>
    
    `,
    controller($element, $timeout, $scope, $compile){

      this.dragging = false;

      this.loaded = false;

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

      this.change_layer = (direction) => {

        this.mock.layer = this.mock.layer || 0;

        if(direction){

          this.mock.layer+=1;

        }
        else {
          this.mock.layer-=1;
        }

        this.mock.save();

      };

      this.$onInit = () => {

        $timeout(() => {

          let overlay = $element[0].querySelector('.mock_overlay');

          // console.dir(overlay);
          if(!overlay) return;

          let new_element = overlay.cloneNode(true);
          overlay.parentNode.replaceChild(new_element, overlay);

          new_element.addEventListener('mousedown', (e) => {
            e.preventDefault();
            $timeout(() => {
              if(!this.dragging && e.which === 1) {
                this.dragging = true;
                this.on_drag && this.on_drag(this.mock, 'start', e);
                $scope.$apply();
                console.dir(e);
              }
            }, 100);


          }, false);

          new_element.addEventListener('mousemove', (e) => {
            e.preventDefault();

            if(this.dragging && e.which === 1) {
              $element[0].style.zIndex = 1000;
              this.on_drag && this.on_drag(this.mock, 'move', e);
              // console.dir(e);
              $scope.$apply();
            }

          }, false);

          new_element.addEventListener('mouseup', (e) => {
            e.preventDefault();
            if(this.dragging) {
              $element[0].style.zIndex = 0;
              this.dragging = false;
              this.on_drag && this.on_drag(this.mock, 'end', e);
              $scope.$apply();
            }
          }, false);

          new_element.addEventListener('mouseleave', (e) => {
            e.preventDefault();
            if(this.dragging) {
              $element[0].style.zIndex = 0;
              this.dragging = false;
              this.on_drag && this.on_drag(this.mock, 'end', e);
              $scope.$apply();
            }
          }, false);

        }, 10);



      };

      this.$onChanges = (changes) => {

        // console.dir(changes);
        if(changes.delete && !changes.delete.currentValue && changes.delete.previousValue) {
          this.$onInit();
        }

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

  gallery.service('Mock', function ($http, Konva, $filter) {
    return class Mock{

      constructor(data){

        Object.assign(this, data);

        this.image = false;

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
      render(bounding_box, scale){

        let old_src = this.image && this.image.image().src;
        let new_src = $filter('mock_image_url')(this, scale);

        console.log(old_src, new_src);

        return new Promise((resolve, reject) => {

          if(!old_src) {

            let img = new Image();

            img.onload = () => {

              this.image = new Konva.Image({
                x: this.x - bounding_box.left,
                y: this.y - bounding_box.top,
                image: img,
                width: 1000,
                height: 1000*(this.height/this.width)
              });
              // console.log(mock._id, image);

              resolve(this);

            };

            img.src = new_src;

          }
          else if(old_src !== new_src) {

            let new_image = new Image();

            new_image.onload = function() {
              this.image && this.image.image(new_image);
            };

            new_image.src = new_src;


          }
          else {

            reject(this);

          }

        });



      }

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

  gallery.filter('mock_image_url', function () {

    const IMAGE_SCALES = [
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

    return function (mock, zoom) {

      let current_scale = IMAGE_SCALES.filter(scale => scale.scale > zoom).sort((a, b) => {
        return b.scale - a.scale;
      }).pop() || {

        dir: '1x',
        scale: 1

      };

      return `/media/mocks/${ current_scale.dir }/${ mock._id }.png`;

    };

  });

  document.addEventListener('DOMContentLoaded', () => {
    angular.bootstrap(document.body, [ 'gallery' ]);
  })

}());