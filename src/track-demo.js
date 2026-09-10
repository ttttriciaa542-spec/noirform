const demoOrder = {
  order: 'NF-TEST01',
  total: 680,
  customer: {
    name: 'Test Customer',
    email: 'test@noirform.co',
    address: '12 Oxford Street',
    city: 'Accra',
    region: 'Greater Accra'
  }
}

if (!localStorage.getItem('noir-last-order')) {
  localStorage.setItem('noir-last-order', JSON.stringify(demoOrder))
}
