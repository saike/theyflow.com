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

  });

  gallery.service('API', function ($http) {

    this.mocks = {
      list: () => {
        return $http.get('/mocks').then((res) => {
          return res.data;
        });
      }
    };

  });

  gallery.component('gallery', {
    template: `
      <div>
        <mock data-ng-repeat="mock in $ctrl.mocks" data-mock="mock"></mock>
        <div data-ng-if="$ctrl.mocks.length < 1">
          <h3>No mocks found...</h3>
        </div>
      </div>
    `,
    controller: function (API) {

      this.mocks = [];

      this.$onInit = () => {

        API.mocks.list().then((mocks) => {

          this.mocks = mocks;
          console.dir(mocks);

        });

      };

    }
  });

  gallery.component('mock', {

    bindings: { mock: '<' },
    template: `
    
      <div style="display: inline-block; width: 20%;">
        <img style="width: 100%;" data-ng-src="{{ $ctrl.mock.url }}" alt="">
      </div>
    
    `,
    controller(){

    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    angular.bootstrap(document.body, [ 'gallery' ]);
  })

}());