App.Settings = Ember.Object.create({
  backend_api_url: 'http://api.example.com',
  use_mock_api : true || window.TESTING // When true, the API calls will be mocked
});