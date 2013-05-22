App.MockResponse = {};
App.MockResponse.get_profile_test_resu_uuid_1 = {
  id: 'test_profile_uuid_1',
  firstName: 'Joe',
  lastName: 'Smith',
  phone: '6041234567',
  email: 'joe.smith@example.com',
  city: 'Vancouver',
  dateOfBirth: '1979-07-09'
};

$.mockjax({ // profile GET
  url: '{base_url}/profiles/test_profile_uuid_1/'.format({base_url: App.Settings.get('backend_api_url')}),
  type: 'get', status: 200, dataType: 'json',
  response: function() {
    this.responseText = JSON.stringify(App.MockResponse.get_profile_test_resu_uuid_1);
  }
});

$.mockjax({ // profile PUT
  url: '{base_url}/profiles/test_profile_uuid_1/'.format({base_url: App.Settings.get('backend_api_url')}),
  type: 'put', status: 200, dataType: 'json',
  response: function() {
    this.responseText = JSON.stringify(App.MockResponse.get_profile_test_resu_uuid_1);
  }
});