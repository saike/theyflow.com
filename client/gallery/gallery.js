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
      component: 'gallery'
    });

    $stateProvider.state({
      name: 'create',
      url: '/create',
      component: 'mockWizard'
    });

  });

  gallery.component('gallery', {
    template: `
      <div>
        <mock data-ng-repeat="mock in $ctrl.mocks" data-mock="mock" data-on-delete="$ctrl.remove_mock"></mock>
        <div data-ng-if="$ctrl.mocks.length < 1">
          <h3>No mocks found...</h3>
        </div>
      </div>
    `,
    controller: function (Mock) {

      this.mocks = [];

      this.$onInit = () => {

        Mock.list().then((mocks) => {

          this.mocks = mocks;
          console.dir(mocks);

        });

      };

      this.remove_mock = (mock) => {
        this.mocks.splice(this.mocks.indexOf(mock), 1);
      };

    }
  });

  gallery.component('mock', {

    bindings: { mock: '<', on_delete: '<onDelete' },
    template: `
    
      <div style="display: inline-block; width: 20%;">
        <img data-ng-show="$ctrl.mock.url" style="width: 100%;" data-ng-src="{{ $ctrl.mock.url }}" alt="">
        <span data-ng-show="!$ctrl.mock.url">NO IMAGE URL <button type="button" data-ng-click="$ctrl.remove_mock()">DELETE</button> </span>
      </div>
    
    `,
    controller(){

      this.remove_mock = () => {
        this.mock && this.mock.remove().then(() => {

          this.on_delete && this.on_delete(this.mock);

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